import { test, expect, describe } from "bun:test";
import {
  paymentClient, mockConnector, MOCK_DECLINE_CARD, MOCK_3DS_CARD, IntegrationError,
  PaymentStatus, RefundStatus, CaptureMethod, AuthenticationType, Currency,
  type ConnectorConfig, type ConnectorRegistry, type AuthorizeRequest,
} from "../src/index";

/**
 * C048 — the agnostic payment interface (a TS reimplementation of the Prism schema), witnessed via the mock connector.
 * The load-bearing properties: the status enums are Prism-integer-EXACT (a real Prism backend stays swappable), the
 * config SELECTS the connector (switch processor without code), a decline is in-band (not thrown), and a full flow is
 * coherent through the seam.
 */
const registry: ConnectorRegistry = { mock: mockConnector, stripe: mockConnector }; // "stripe" is the mock here (interface-first)
const cfg = (name: string): ConnectorConfig => ({ connectorConfig: { [name]: { apiKey: { value: "sk_test_1" } } } });
const card = (pan: string): AuthorizeRequest["paymentMethod"] => ({
  card: { cardNumber: { value: pan }, cardExpMonth: { value: "12" }, cardExpYear: { value: "2030" }, cardCvc: { value: "123" } },
});
const authReq = (pan: string, over: Partial<AuthorizeRequest> = {}): AuthorizeRequest => ({
  merchantTransactionId: "txn_1",
  amount: { minorAmount: 1000, currency: Currency.USD },
  captureMethod: CaptureMethod.AUTOMATIC,
  paymentMethod: card(pan),
  authType: AuthenticationType.NO_THREE_DS,
  ...over,
});

describe("Prism-integer-exact status semantics", () => {
  test("PaymentStatus + RefundStatus carry Prism's exact integer values", () => {
    expect([PaymentStatus.AUTHORIZED, PaymentStatus.CHARGED, PaymentStatus.VOIDED, PaymentStatus.FAILURE, PaymentStatus.AUTHENTICATION_PENDING]).toEqual([6, 8, 11, 21, 4]);
    expect([RefundStatus.REFUND_PENDING, RefundStatus.REFUND_SUCCESS]).toEqual([3, 4]);
  });
});

describe("config selects the connector (switch processor by config)", () => {
  test("paymentClient binds the single named processor", () => {
    expect(paymentClient(cfg("mock"), registry).name).toBe("mock");
    expect(paymentClient(cfg("stripe"), registry).name).toBe("mock"); // same mock, chosen by a different config
  });

  test("a config naming zero, many, or an unregistered processor throws IntegrationError", () => {
    expect(() => paymentClient({ connectorConfig: {} }, registry)).toThrow(IntegrationError);
    expect(() => paymentClient({ connectorConfig: { mock: { apiKey: { value: "x" } }, stripe: { apiKey: { value: "y" } } } }, registry)).toThrow(/exactly one/);
    expect(() => paymentClient(cfg("adyen"), registry)).toThrow(/no connector registered for "adyen"/);
  });
});

describe("the unified flow through the seam", () => {
  test("auto-capture authorize → CHARGED; manual → AUTHORIZED then capture → CHARGED", async () => {
    const c = paymentClient(cfg("mock"), registry);
    const auto = await c.authorize(authReq("4111111111111111"));
    expect(auto.status).toBe(PaymentStatus.CHARGED);
    expect(auto.connectorTransactionId).toBeString();

    const manual = await c.authorize(authReq("4111111111111111", { captureMethod: CaptureMethod.MANUAL }));
    expect(manual.status).toBe(PaymentStatus.AUTHORIZED);
    const cap = await c.capture({ merchantCaptureId: "cap_1", connectorTransactionId: manual.connectorTransactionId!, amountToCapture: { minorAmount: 1000, currency: Currency.USD } });
    expect(cap.status).toBe(PaymentStatus.CHARGED);
  });

  test("a decline card is IN-BAND FAILURE (not a throw); 3DS → AUTHENTICATION_PENDING + redirection", async () => {
    const c = paymentClient(cfg("mock"), registry);
    const declined = await c.authorize(authReq(MOCK_DECLINE_CARD));
    expect(declined.status).toBe(PaymentStatus.FAILURE);
    expect(declined.error?.code).toBe("card_declined");

    const tds = await c.authorize(authReq(MOCK_3DS_CARD, { returnUrl: "https://app/return" }));
    expect(tds.status).toBe(PaymentStatus.AUTHENTICATION_PENDING);
    expect(tds.redirectionData?.url).toBe("https://app/return");
  });

  test("void + refund + sync are coherent across the flow", async () => {
    const c = paymentClient(cfg("mock"), registry);
    const auth = await c.authorize(authReq("4111111111111111", { captureMethod: CaptureMethod.MANUAL }));
    const voided = await c.void({ merchantVoidId: "v_1", connectorTransactionId: auth.connectorTransactionId! });
    expect(voided.status).toBe(PaymentStatus.VOIDED);
    expect((await c.sync({ connectorTransactionId: auth.connectorTransactionId! })).status).toBe(PaymentStatus.VOIDED);

    const charged = await c.authorize(authReq("4111111111111111"));
    const refund = await c.refund({ merchantRefundId: "r_1", connectorTransactionId: charged.connectorTransactionId!, refundAmount: { minorAmount: 500, currency: Currency.USD }, paymentAmount: 1000 });
    expect(refund.status).toBe(RefundStatus.REFUND_SUCCESS);
  });

  test("a connector with a bad config throws IntegrationError at bind time", () => {
    expect(() => paymentClient({ connectorConfig: { mock: {} } }, registry)).toThrow(/needs an apiKey/);
  });
});
