import { test, expect, describe } from "bun:test";
import {
  createCustomer, createSetupIntent, listPaymentMethods, setDefaultPaymentMethod, detachPaymentMethod,
  stripePost, toForm, type StripeConfig,
} from "../src/index";

/**
 * C046 — @suluk/billing v1, witnessed with a MOCK fetch (the injected transport seam). We assert the right Stripe request
 * (path + method + auth header + form body) and the response handling — no live Stripe, no effect dep.
 */
interface Call {
  path: string;
  method: string;
  body: string;
  headers: Record<string, string>;
}
type Route = { status?: number; body: unknown };
function mockStripe(routes: Record<string, Route>): { cfg: StripeConfig; calls: Call[] } {
  const calls: Call[] = [];
  const fetchMock = (async (url: string | URL, init?: RequestInit) => {
    const path = String(url).replace("https://api.stripe.com/v1/", "");
    const method = (init?.method ?? "GET").toUpperCase();
    calls.push({ path, method, body: (init?.body as string) ?? "", headers: (init?.headers as Record<string, string>) ?? {} });
    const key = Object.keys(routes).find((k) => `${method} ${path}`.startsWith(k));
    const r = key ? routes[key] : { body: {} };
    return new Response(JSON.stringify(r.body), { status: r.status ?? 200 });
  }) as unknown as typeof fetch;
  return { cfg: { secretKey: "sk_test", fetch: fetchMock }, calls };
}

describe("the transport seam", () => {
  test("POSTs to Stripe with the bearer auth + form body; passes the idempotency-key when given", async () => {
    const { cfg, calls } = mockStripe({ "POST refunds": { body: { id: "re_1" } } });
    await stripePost(cfg, "refunds", toForm({ charge: "ch_1", amount: 500 }), "scope:ch_1");
    expect(calls[0].method).toBe("POST");
    expect(calls[0].path).toBe("refunds");
    expect(calls[0].headers.authorization).toBe("Bearer sk_test");
    expect(calls[0].headers["idempotency-key"]).toBe("scope:ch_1");
    expect(calls[0].body).toContain("charge=ch_1");
    expect(calls[0].body).toContain("amount=500");
  });
});

describe("customer + intent creation", () => {
  test("createCustomer returns the id and sends email + metadata", async () => {
    const { cfg, calls } = mockStripe({ "POST customers": { body: { id: "cus_1" } } });
    expect(await createCustomer(cfg, "a@b.com", "user_1")).toBe("cus_1");
    expect(calls[0].body).toContain("email=a%40b.com");
    expect(calls[0].body).toContain("metadata%5BuserId%5D=user_1"); // metadata[userId]=user_1
  });

  test("createSetupIntent returns the client secret", async () => {
    const { cfg } = mockStripe({ "POST setup_intents": { body: { client_secret: "si_secret_1" } } });
    expect(await createSetupIntent(cfg, "cus_1", "user_1")).toBe("si_secret_1");
  });

  test("a Stripe error throws with the error message", async () => {
    const { cfg } = mockStripe({ "POST customers": { status: 402, body: { error: { message: "card declined" } } } });
    await expect(createCustomer(cfg, "a@b.com", "user_1")).rejects.toThrow("card declined");
  });
});

describe("the saved-card surface", () => {
  test("listPaymentMethods maps the wire shape + marks the invoice default", async () => {
    const { cfg } = mockStripe({
      "GET payment_methods": { body: { data: [{ id: "pm_1", card: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2030 }, billing_details: { name: "A B", address: { line1: "1 St", city: "SF", state: "CA", postal_code: "94000", country: "US" } } }] } },
      "GET customers/cus_1": { body: { invoice_settings: { default_payment_method: "pm_1" } } },
    });
    const cards = await listPaymentMethods(cfg, "cus_1");
    expect(cards).toEqual([{ id: "pm_1", brand: "visa", last4: "4242", expMonth: 12, expYear: 2030, name: "A B", line1: "1 St", line2: null, city: "SF", region: "CA", postalCode: "94000", country: "US", isDefault: true }]);
  });

  test("setDefaultPaymentMethod posts the nested invoice_settings; detach hits the detach path", async () => {
    const setMock = mockStripe({ "POST customers/cus_1": { body: { id: "cus_1" } } });
    await setDefaultPaymentMethod(setMock.cfg, "cus_1", "pm_9");
    expect(setMock.calls[0].body).toContain("invoice_settings%5Bdefault_payment_method%5D=pm_9");

    const detachMock = mockStripe({ "POST payment_methods/pm_9/detach": { body: { id: "pm_9" } } });
    await detachPaymentMethod(detachMock.cfg, "pm_9");
    expect(detachMock.calls[0].path).toBe("payment_methods/pm_9/detach");
  });

  test("a failed set-default throws", async () => {
    const { cfg } = mockStripe({ "POST customers/cus_1": { status: 400, body: {} } });
    await expect(setDefaultPaymentMethod(cfg, "cus_1", "pm_9")).rejects.toThrow(/set-default failed/);
  });
});
