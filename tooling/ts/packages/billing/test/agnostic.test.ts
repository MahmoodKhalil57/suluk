import { test, expect, describe } from "bun:test";
import { paymentConnector, statusString } from "../src/agnostic";
import { createCustomer } from "../src/index";
import { PaymentStatus } from "@suluk/payments";
import type { StripeConfig } from "../src/transport";

/**
 * C048 — billing's server-side charge + customer paths now run through @suluk/payments. The existing billing-v2 suite is
 * the behavioural parity net (same tests, new innards, still green); this pins the new bridge directly: the connector is
 * a real Stripe connector, and the unified→billing status mapping is exact.
 */
interface Call { path: string; body: string }
function mockStripe(routes: Record<string, unknown>): { cfg: StripeConfig; calls: Call[] } {
  const calls: Call[] = [];
  const fetchMock = (async (url: string | URL, init?: RequestInit) => {
    const path = String(url).replace("https://api.stripe.com/v1/", "");
    calls.push({ path, body: (init?.body as string) ?? "" });
    const key = Object.keys(routes).find((k) => path.startsWith(k));
    return new Response(JSON.stringify(key ? routes[key] : {}), { status: 200 });
  }) as unknown as typeof fetch;
  return { cfg: { secretKey: "sk_test", fetch: fetchMock }, calls };
}

describe("the agnostic bridge", () => {
  test("paymentConnector(cfg) is a Stripe-backed connector bound to the billing config", async () => {
    const { cfg, calls } = mockStripe({ customers: { id: "cus_9" } });
    const c = paymentConnector(cfg);
    expect(c.name).toBe("stripe");
    expect(await c.createCustomer!({ email: "x@y.com" })).toEqual({ customerId: "cus_9" });
    expect(calls[0].path).toBe("customers");
  });

  test("createCustomer routes through @suluk/payments (same POST /customers request)", async () => {
    const { cfg, calls } = mockStripe({ customers: { id: "cus_1" } });
    expect(await createCustomer(cfg, "a@b.com", "user_1")).toBe("cus_1");
    expect(calls[0].body).toContain("email=a%40b.com");
    expect(calls[0].body).toContain("metadata%5BuserId%5D=user_1");
  });

  test("statusString maps the unified status back to billing's Stripe-ish strings", () => {
    expect(statusString(PaymentStatus.CHARGED)).toBe("succeeded");
    expect(statusString(PaymentStatus.AUTHENTICATION_PENDING)).toBe("requires_action");
    expect(statusString(PaymentStatus.PENDING)).toBe("processing");
    expect(statusString(PaymentStatus.FAILURE)).toBe("failed");
    expect(statusString(PaymentStatus.AUTHORIZATION_FAILED)).toBe("failed"); // any other → failed
  });
});
