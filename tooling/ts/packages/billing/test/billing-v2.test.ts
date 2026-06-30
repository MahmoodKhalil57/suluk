import { test, expect, describe } from "bun:test";
import {
  createCheckout, createSubscriptionCheckout, createPortalSessionForCustomer,
  createPaymentIntentOnDefaultCard, chargeOffSession,
  ceilingFor, planById, planByPrice, ensurePlanPrice, getSubscriptionStatus, changeSubscriptionPlan,
  createSubscriptionOnDefaultCard, type StripeConfig, type SubPlan,
} from "../src/index";

/** C046 v2 — the money-moving + subscription wrappers, witnessed with a MOCK fetch (the injected transport seam): we
 *  assert the right Stripe request (path + method + form body) and the response handling. No live Stripe, no effect dep. */
interface Call { path: string; method: string; body: string; headers: Record<string, string> }
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

const STARTER: SubPlan = { id: "starter", name: "Starter", credits: 200, priceCents: 1000, label: "200 credits / month" };
const PRO: SubPlan = { id: "pro", name: "Pro", credits: 700, priceCents: 3000, label: "700 credits / month" };
const PLANS = [STARTER, PRO];
const TF = { lookupKeyPrefix: "tf", productName: (p: SubPlan) => `acme — ${p.name} (monthly)` };

/** A customer whose default card is `pm_1`, so the default-card paths resolve a PM. */
const withDefaultCard = (routes: Record<string, Route>) =>
  mockStripe({
    "GET payment_methods": { body: { data: [{ id: "pm_1", card: { brand: "visa", last4: "4242" }, billing_details: { address: { country: "US" } } }] } },
    "GET customers/cus_1": { body: { invoice_settings: { default_payment_method: "pm_1" } } },
    ...routes,
  });

describe("money-moving: checkout + portal", () => {
  test("createCheckout posts mode=payment with the product name, metadata, saved card; returns the hosted url", async () => {
    const { cfg, calls } = mockStripe({ "POST checkout/sessions": { body: { url: "https://checkout.stripe.com/c/x" } } });
    const url = await createCheckout(cfg, { userId: "u1", customerId: "cus_1", amountCents: 2000, credits: 600, successUrl: "https://app/ok", cancelUrl: "https://app/no", productName: "acme — 600 credits" });
    expect(url).toBe("https://checkout.stripe.com/c/x");
    const body = calls[0].body;
    expect(body).toContain("mode=payment");
    expect(body).toContain("product_data%5D%5Bname%5D=acme"); // ...[product_data][name]=acme...
    expect(body).toContain("setup_future_usage%5D=off_session");
    expect(body).toContain("metadata%5Bcredits%5D=600");
  });

  test("createSubscriptionCheckout posts mode=subscription with the recurring price + plan metadata", async () => {
    const { cfg, calls } = mockStripe({ "POST checkout/sessions": { body: { url: "https://checkout.stripe.com/c/sub" } } });
    const url = await createSubscriptionCheckout(cfg, { userId: "u1", plan: PRO, successUrl: "https://app/ok", cancelUrl: "https://app/no", productName: "acme — Pro" });
    expect(url).toBe("https://checkout.stripe.com/c/sub");
    expect(calls[0].body).toContain("mode=subscription");
    expect(calls[0].body).toContain("recurring%5D%5Binterval%5D=month");
    expect(calls[0].body).toContain("subscription_data%5Bmetadata%5D%5BplanId%5D=pro");
  });

  test("createCheckout throws the Stripe error message on failure", async () => {
    const { cfg } = mockStripe({ "POST checkout/sessions": { status: 400, body: { error: { message: "amount too small" } } } });
    await expect(createCheckout(cfg, { userId: "u1", customerId: null, amountCents: 1, credits: 0, successUrl: "s", cancelUrl: "c", productName: "x" })).rejects.toThrow("amount too small");
  });

  test("createPortalSessionForCustomer returns the portal url with the return_url", async () => {
    const { cfg, calls } = mockStripe({ "POST billing_portal/sessions": { body: { url: "https://billing.stripe.com/p/x" } } });
    expect(await createPortalSessionForCustomer(cfg, "cus_1", "https://app/account")).toBe("https://billing.stripe.com/p/x");
    expect(calls[0].body).toContain("return_url=https%3A%2F%2Fapp%2Faccount");
  });
});

describe("money-moving: on-default-card top-up", () => {
  test("createPaymentIntentOnDefaultCard pins the resolved default PM and returns the client secret", async () => {
    const { cfg, calls } = withDefaultCard({ "POST payment_intents": { body: { client_secret: "pi_secret_1" } } });
    const secret = await createPaymentIntentOnDefaultCard(cfg, "cus_1", 2000, { userId: "u1", credits: 600 });
    expect(secret).toBe("pi_secret_1");
    const pi = calls.find((c) => c.path === "payment_intents")!;
    expect(pi.body).toContain("payment_method=pm_1");
    expect(pi.body).toContain("metadata%5Bsource%5D=onsite_topup");
  });

  test("returns null when the customer has no default card (no charge attempted)", async () => {
    const { cfg, calls } = mockStripe({
      "GET payment_methods": { body: { data: [] } },
      "GET customers/cus_1": { body: { invoice_settings: { default_payment_method: null } } },
    });
    expect(await createPaymentIntentOnDefaultCard(cfg, "cus_1", 2000, { userId: "u1", credits: 600 })).toBeNull();
    expect(calls.some((c) => c.path === "payment_intents" && c.method === "POST")).toBe(false);
  });
});

describe("money-moving: off-session charge (auto-top-up)", () => {
  test("a succeeded charge returns id + status, authRequired false", async () => {
    const { cfg, calls } = mockStripe({ "POST payment_intents": { body: { id: "pi_1", status: "succeeded" } } });
    expect(await chargeOffSession(cfg, "cus_1", "pm_1", 2000, { userId: "u1", credits: 600 })).toEqual({ id: "pi_1", status: "succeeded", authRequired: false });
    expect(calls[0].body).toContain("off_session=true");
    expect(calls[0].body).toContain("metadata%5Bsource%5D=auto_topup");
  });

  test("a 3DS decline (authentication_required) returns authRequired:true — NOT a throw", async () => {
    const { cfg } = mockStripe({ "POST payment_intents": { status: 402, body: { error: { code: "authentication_required", payment_intent: { id: "pi_2", status: "requires_action" } } } } });
    expect(await chargeOffSession(cfg, "cus_1", "pm_1", 2000, { userId: "u1", credits: 600 })).toEqual({ id: "pi_2", status: "requires_action", authRequired: true });
  });

  test("a hard 402 card decline is RETURNED (status failed), not thrown", async () => {
    const { cfg } = mockStripe({ "POST payment_intents": { status: 402, body: { error: { code: "card_declined", payment_intent: { id: "pi_3", status: "failed" } } } } });
    expect(await chargeOffSession(cfg, "cus_1", "pm_1", 2000, { userId: "u1", credits: 600 })).toEqual({ id: "pi_3", status: "failed", authRequired: false });
  });

  test("a transient/transport failure THROWS (it may recover)", async () => {
    const { cfg } = mockStripe({ "POST payment_intents": { status: 500, body: { error: { message: "stripe down" } } } });
    await expect(chargeOffSession(cfg, "cus_1", "pm_1", 2000, { userId: "u1", credits: 600 })).rejects.toThrow("stripe down");
  });
});

describe("subscriptions: ceilingFor (pure paid-ceiling math)", () => {
  test("honours a stored ceiling only when its End matches this cycle; else falls back to the current price", () => {
    const meta = { cycleCeilingCents: "3000", cycleCeilingEnd: "100" };
    expect(ceilingFor(meta, 100, 1000)).toBe(3000); // same cycle → the higher paid ceiling stands
    expect(ceilingFor(meta, 200, 1000)).toBe(1000); // different cycle → reset to current price
    expect(ceilingFor(undefined, 100, 1000)).toBe(1000); // no metadata → current price
    expect(ceilingFor({ cycleCeilingCents: "500", cycleCeilingEnd: "100" }, 100, 1000)).toBe(1000); // max(500,1000)
  });

  test("planById / planByPrice resolve against the injected catalog", () => {
    expect(planById(PLANS, "pro")).toBe(PRO);
    expect(planById(PLANS, "nope")).toBeUndefined();
    expect(planByPrice(PLANS, 1000)).toBe(STARTER);
    expect(planByPrice(PLANS, 999)).toBeUndefined();
  });
});

describe("subscriptions: pricing + status + change", () => {
  test("ensurePlanPrice REUSES an existing lookup_key price (no product/price create)", async () => {
    const { cfg, calls } = mockStripe({ "GET prices": { body: { data: [{ id: "price_existing" }] } } });
    expect(await ensurePlanPrice(cfg, PRO, TF)).toBe("price_existing");
    expect(calls.length).toBe(1); // only the GET — no product/price POST
    expect(calls[0].path).toContain("lookup_keys[0]=tf_pro_3000_700_m"); // literal brackets in the GET path
  });

  test("ensurePlanPrice CREATES product + price when none is found", async () => {
    const { cfg, calls } = mockStripe({
      "GET prices": { body: { data: [] } },
      "POST products": { body: { id: "prod_1" } },
      "POST prices": { body: { id: "price_new" } },
    });
    expect(await ensurePlanPrice(cfg, PRO, TF)).toBe("price_new");
    expect(calls.map((c) => `${c.method} ${c.path.split("?")[0]}`)).toEqual(["GET prices", "POST products", "POST prices"]);
  });

  test("getSubscriptionStatus maps a live sub; returns null for a non-live one", async () => {
    const live = mockStripe({ "GET subscriptions/sub_1": { body: { status: "active", cancel_at_period_end: false, current_period_end: 1000, items: { data: [{ price: { unit_amount: 3000 } }] }, metadata: { planId: "pro" } } } });
    expect(await getSubscriptionStatus(live.cfg, "sub_1", PLANS)).toEqual({ planId: "pro", status: "active", currentPeriodEnd: 1_000_000, cancelAtPeriodEnd: false, paidCeilingCents: 3000 });
    const dead = mockStripe({ "GET subscriptions/sub_1": { body: { status: "canceled" } } });
    expect(await getSubscriptionStatus(dead.cfg, "sub_1", PLANS)).toBeNull();
  });

  test("changeSubscriptionPlan: ABOVE the ceiling = an upgrade (always_invoice + a 3DS clientSecret)", async () => {
    const { cfg, calls } = mockStripe({
      "GET subscriptions/sub_1": { body: { status: "active", cancel_at_period_end: false, current_period_end: 1000, items: { data: [{ id: "si_1", price: { unit_amount: 1000 } }] }, metadata: { planId: "starter" } } },
      "GET prices": { body: { data: [{ id: "price_pro" }] } },
      "POST subscriptions/sub_1": { body: { id: "sub_1", latest_invoice: { status: "open", confirmation_secret: { client_secret: "pi_up_secret" } } } },
    });
    const r = await changeSubscriptionPlan(cfg, "sub_1", PRO, "u1", PLANS, TF);
    expect(r).toEqual({ kind: "upgrade", clientSecret: "pi_up_secret", currentPeriodEnd: 1_000_000 });
    const post = calls.find((c) => c.method === "POST" && c.path === "subscriptions/sub_1")!;
    expect(post.body).toContain("proration_behavior=always_invoice");
    expect(post.body).toContain("payment_behavior=pending_if_incomplete");
  });

  test("changeSubscriptionPlan: AT/BELOW the ceiling = a deferred downgrade (proration none, no charge, no secret)", async () => {
    const { cfg, calls } = mockStripe({
      "GET subscriptions/sub_1": { body: { status: "active", cancel_at_period_end: false, current_period_end: 1000, items: { data: [{ id: "si_1", price: { unit_amount: 3000 } }] }, metadata: { planId: "pro" } } },
      "GET prices": { body: { data: [{ id: "price_starter" }] } },
      "POST subscriptions/sub_1": { body: { id: "sub_1", latest_invoice: { status: "paid" } } },
    });
    const r = await changeSubscriptionPlan(cfg, "sub_1", STARTER, "u1", PLANS, TF);
    expect(r).toEqual({ kind: "downgrade", clientSecret: null, currentPeriodEnd: 1_000_000 });
    const post = calls.find((c) => c.method === "POST" && c.path === "subscriptions/sub_1")!;
    expect(post.body).toContain("proration_behavior=none");
  });

  test("createSubscriptionOnDefaultCard charges the saved card; null when there's none", async () => {
    const ok = withDefaultCard({
      "GET prices": { body: { data: [{ id: "price_pro" }] } },
      "POST subscriptions": { body: { id: "sub_new", latest_invoice: { confirmation_secret: { client_secret: "sub_secret" } } } },
    });
    expect(await createSubscriptionOnDefaultCard(ok.cfg, "cus_1", PRO, "u1", TF)).toEqual({ clientSecret: "sub_secret", subscriptionId: "sub_new" });

    const noCard = mockStripe({ "GET payment_methods": { body: { data: [] } }, "GET customers/cus_1": { body: { invoice_settings: {} } } });
    expect(await createSubscriptionOnDefaultCard(noCard.cfg, "cus_1", PRO, "u1", TF)).toBeNull();
  });
});
