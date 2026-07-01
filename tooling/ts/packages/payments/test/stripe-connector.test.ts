import { test, expect, describe } from "bun:test";
import {
  stripeConnector, paymentClient, ConnectorError,
  PaymentStatus, RefundStatus, CaptureMethod, AuthenticationType, Currency,
  type ConnectorConfig, type AuthorizeRequest, type HttpOptions,
} from "../src/index";

/**
 * C048 — the built-in Stripe connector, witnessed with a MOCK fetch. The load-bearing thing is the STATUS MAPPING
 * (Stripe PI status → the unified integer enum) + the right Stripe request; a wrong mapping mis-reports money. No live
 * Stripe.
 */
interface Call { path: string; method: string; body: string; headers: Record<string, string> }
function mock(routes: Record<string, { status?: number; body: unknown }>): { http: HttpOptions; calls: Call[] } {
  const calls: Call[] = [];
  const fetchMock = (async (url: string | URL, init?: RequestInit) => {
    const path = String(url).replace("https://api.stripe.com/v1/", "");
    const method = (init?.method ?? "GET").toUpperCase();
    calls.push({ path, method, body: (init?.body as string) ?? "", headers: (init?.headers as Record<string, string>) ?? {} });
    const key = Object.keys(routes).find((k) => `${method} ${path}`.startsWith(k));
    const r = key ? routes[key] : { body: {} };
    return new Response(JSON.stringify(r.body), { status: r.status ?? 200 });
  }) as unknown as typeof fetch;
  return { http: { fetch: fetchMock }, calls };
}
const cfg: ConnectorConfig = { connectorConfig: { stripe: { apiKey: { value: "sk_test_1" } } } };
const rawCard = (over: Partial<AuthorizeRequest> = {}): AuthorizeRequest => ({
  merchantTransactionId: "txn_1",
  amount: { minorAmount: 2000, currency: Currency.USD },
  captureMethod: CaptureMethod.AUTOMATIC,
  paymentMethod: { card: { cardNumber: { value: "4242424242424242" }, cardExpMonth: { value: "12" }, cardExpYear: { value: "2030" }, cardCvc: { value: "123" } } },
  authType: AuthenticationType.NO_THREE_DS,
  ...over,
});

describe("authorize — request shape + status mapping", () => {
  test("auto-capture success → CHARGED, with the right PI request + idempotency key", async () => {
    const m = mock({ "POST payment_intents": { body: { id: "pi_1", status: "succeeded", amount: 2000, currency: "usd" } } });
    const c = paymentClient(cfg, { stripe: stripeConnector }, m.http);
    const res = await c.authorize(rawCard());
    expect(res.status).toBe(PaymentStatus.CHARGED);
    expect(res.connectorTransactionId).toBe("pi_1");
    expect(res.amount).toEqual({ minorAmount: 2000, currency: "USD" });
    const call = m.calls[0];
    expect(call.body).toContain("amount=2000");
    expect(call.body).toContain("currency=usd");
    expect(call.body).toContain("confirm=true");
    expect(call.body).toContain("payment_method_data%5Btype%5D=card");
    expect(call.body).toContain("payment_method_data%5Bcard%5D%5Bnumber%5D=4242424242424242");
    expect(call.headers["idempotency-key"]).toBe("auth:txn_1");
  });

  test("manual capture → AUTHORIZED (requires_capture)", async () => {
    const m = mock({ "POST payment_intents": { body: { id: "pi_2", status: "requires_capture" } } });
    const res = await stripeConnector(cfg.connectorConfig.stripe, m.http).authorize(rawCard({ captureMethod: CaptureMethod.MANUAL }));
    expect(res.status).toBe(PaymentStatus.AUTHORIZED);
    expect(m.calls[0].body).toContain("capture_method=manual");
  });

  test("requires_action → AUTHENTICATION_PENDING + redirection url", async () => {
    const m = mock({ "POST payment_intents": { body: { id: "pi_3", status: "requires_action", next_action: { redirect_to_url: { url: "https://hooks.stripe.com/3ds" } } } } });
    const res = await stripeConnector(cfg.connectorConfig.stripe, m.http).authorize(rawCard({ authType: AuthenticationType.THREE_DS, returnUrl: "https://app/return" }));
    expect(res.status).toBe(PaymentStatus.AUTHENTICATION_PENDING);
    expect(res.redirectionData?.url).toBe("https://hooks.stripe.com/3ds");
  });

  test("a card_error (402) is IN-BAND FAILURE with the decline code — not thrown", async () => {
    const m = mock({ "POST payment_intents": { status: 402, body: { error: { type: "card_error", code: "card_declined", decline_code: "insufficient_funds", message: "Your card has insufficient funds.", payment_intent: { id: "pi_4" } } } } });
    const res = await stripeConnector(cfg.connectorConfig.stripe, m.http).authorize(rawCard());
    expect(res.status).toBe(PaymentStatus.FAILURE);
    expect(res.error?.code).toBe("insufficient_funds");
    expect(res.connectorTransactionId).toBe("pi_4");
  });

  test("an off-session authentication_required (402) → AUTHENTICATION_PENDING (not thrown)", async () => {
    const m = mock({ "POST payment_intents": { status: 402, body: { error: { type: "invalid_request_error", code: "authentication_required", payment_intent: { id: "pi_5", status: "requires_action" } } } } });
    const res = await stripeConnector(cfg.connectorConfig.stripe, m.http).authorize(rawCard({ offSession: true, paymentMethod: { token: { value: "pm_saved" } } }));
    expect(res.status).toBe(PaymentStatus.AUTHENTICATION_PENDING);
    expect(res.connectorTransactionId).toBe("pi_5");
    expect(m.calls[0].body).toContain("off_session=true");
    expect(m.calls[0].body).toContain("payment_method=pm_saved");
  });

  test("a non-card hard error THROWS ConnectorError", async () => {
    const m = mock({ "POST payment_intents": { status: 500, body: { error: { type: "api_error", message: "Stripe is down" } } } });
    await expect(stripeConnector(cfg.connectorConfig.stripe, m.http).authorize(rawCard())).rejects.toThrow(ConnectorError);
  });
});

describe("capture / void / refund / sync / customer", () => {
  test("capture → CHARGED; void → VOIDED", async () => {
    const cap = mock({ "POST payment_intents/pi_1/capture": { body: { id: "pi_1", status: "succeeded" } } });
    expect((await stripeConnector(cfg.connectorConfig.stripe, cap.http).capture({ merchantCaptureId: "c1", connectorTransactionId: "pi_1", amountToCapture: { minorAmount: 2000, currency: Currency.USD } })).status).toBe(PaymentStatus.CHARGED);
    const vd = mock({ "POST payment_intents/pi_1/cancel": { body: { id: "pi_1", status: "canceled" } } });
    expect((await stripeConnector(cfg.connectorConfig.stripe, vd.http).void({ merchantVoidId: "v1", connectorTransactionId: "pi_1" })).status).toBe(PaymentStatus.VOIDED);
  });

  test("refund maps succeeded→SUCCESS and pending→PENDING; passes payment_intent + amount + idempotency", async () => {
    const ok = mock({ "POST refunds": { body: { id: "re_1", status: "succeeded" } } });
    const r = await stripeConnector(cfg.connectorConfig.stripe, ok.http).refund({ merchantRefundId: "r1", connectorTransactionId: "pi_1", refundAmount: { minorAmount: 500, currency: Currency.USD }, paymentAmount: 2000 });
    expect(r.status).toBe(RefundStatus.REFUND_SUCCESS);
    expect(r.connectorRefundId).toBe("re_1");
    expect(ok.calls[0].body).toContain("payment_intent=pi_1");
    expect(ok.calls[0].body).toContain("amount=500");
    expect(ok.calls[0].headers["idempotency-key"]).toBe("refund:r1");

    const pend = mock({ "POST refunds": { body: { id: "re_2", status: "pending" } } });
    expect((await stripeConnector(cfg.connectorConfig.stripe, pend.http).refund({ merchantRefundId: "r2", connectorTransactionId: "pi_1", refundAmount: { minorAmount: 500, currency: Currency.USD }, paymentAmount: 2000 })).status).toBe(RefundStatus.REFUND_PENDING);
  });

  test("sync maps the live PI status; createCustomer returns the id", async () => {
    const s = mock({ "GET payment_intents/pi_1": { body: { id: "pi_1", status: "succeeded" } } });
    expect((await stripeConnector(cfg.connectorConfig.stripe, s.http).sync({ connectorTransactionId: "pi_1" })).status).toBe(PaymentStatus.CHARGED);
    const cu = mock({ "POST customers": { body: { id: "cus_1" } } });
    expect(await stripeConnector(cfg.connectorConfig.stripe, cu.http).createCustomer!({ email: "a@b.com", metadata: { userId: "u1" } })).toEqual({ customerId: "cus_1" });
    expect(cu.calls[0].body).toContain("email=a%40b.com");
    expect(cu.calls[0].body).toContain("metadata%5BuserId%5D=u1");
  });
});

describe("the client-token surface (browser-confirmable sessions)", () => {
  test("createPaymentSession (Payment Element): automatic_payment_methods + optional save; returns the client secret", async () => {
    const m = mock({ "POST payment_intents": { body: { id: "pi_9", client_secret: "pi_9_secret" } } });
    const s = await stripeConnector(cfg.connectorConfig.stripe, m.http).createPaymentSession!({
      amount: { minorAmount: 2000, currency: Currency.USD }, customerId: "cus_1", setupFutureUsage: true, metadata: { userId: "u1", source: "onsite_topup" },
    });
    expect(s).toEqual({ clientSecret: "pi_9_secret", connectorTransactionId: "pi_9", customerId: "cus_1" });
    const b = m.calls[0].body;
    expect(b).toContain("automatic_payment_methods%5Benabled%5D=true");
    expect(b).toContain("setup_future_usage=off_session");
    expect(b).toContain("metadata%5Bsource%5D=onsite_topup");
    expect(b).not.toContain("confirm=true"); // the BROWSER confirms — the server only creates the intent
  });

  test("createPaymentSession (one-click): pins the saved card, no automatic_payment_methods", async () => {
    const m = mock({ "POST payment_intents": { body: { id: "pi_10", client_secret: "pi_10_secret" } } });
    const s = await stripeConnector(cfg.connectorConfig.stripe, m.http).createPaymentSession!({
      amount: { minorAmount: 2000, currency: Currency.USD }, customerId: "cus_1", paymentMethod: { value: "pm_1" },
    });
    expect(s.clientSecret).toBe("pi_10_secret");
    expect(m.calls[0].body).toContain("payment_method=pm_1");
    expect(m.calls[0].body).not.toContain("automatic_payment_methods");
  });

  test("createSetupSession: vaults a card (usage=off_session); returns the client secret", async () => {
    const m = mock({ "POST setup_intents": { body: { id: "seti_1", client_secret: "seti_secret" } } });
    const s = await stripeConnector(cfg.connectorConfig.stripe, m.http).createSetupSession!({ customerId: "cus_1", metadata: { userId: "u1" } });
    expect(s.clientSecret).toBe("seti_secret");
    expect(m.calls[0].path).toBe("setup_intents");
    expect(m.calls[0].body).toContain("usage=off_session");
  });

  test("a session that returns no client_secret throws ConnectorError", async () => {
    const m = mock({ "POST payment_intents": { status: 400, body: { error: { code: "amount_too_small", message: "Amount too small" } } } });
    await expect(stripeConnector(cfg.connectorConfig.stripe, m.http).createPaymentSession!({ amount: { minorAmount: 1, currency: Currency.USD } })).rejects.toThrow(ConnectorError);
  });
});
