/**
 * A mock connector (C048) — proves the {@link PaymentConnector} seam end-to-end without a real processor, and doubles as a
 * deterministic local/test stand-in (like a processor's test mode). It keeps a tiny in-memory ledger so capture/void/
 * refund/sync are coherent across a flow. Behaviour keys off the PAN: a decline test card → in-band `FAILURE`; a 3DS
 * card (or `THREE_DS` auth) → `AUTHENTICATION_PENDING` + redirection; otherwise `CHARGED` (auto) / `AUTHORIZED` (manual).
 * This is NOT a payment processor — the real connectors (stripe, adyen, …) are the follow-on build.
 */
import type { ConnectorFactory, PaymentConnector } from "./connector";
import { IntegrationError } from "./errors";
import { AuthenticationType, CaptureMethod, PaymentStatus, RefundStatus, type MinorAmount } from "./types";

/** Well-known test PANs (Stripe-compatible values, for familiarity). */
export const MOCK_DECLINE_CARD = "4000000000000002";
export const MOCK_3DS_CARD = "4000000000003220";

export const mockConnector: ConnectorFactory = (auth) => {
  if (!auth.apiKey?.value) throw new IntegrationError("INVALID_CONFIGURATION", "mock connector needs an apiKey");
  const ledger = new Map<string, { amount: MinorAmount; status: PaymentStatus }>();
  let seq = 0;
  const id = () => `mock_${++seq}`;

  const connector: PaymentConnector = {
    name: "mock",
    async authorize(req) {
      const pan = req.paymentMethod.card?.cardNumber.value ?? req.paymentMethod.token?.token.value ?? "";
      if (pan === MOCK_DECLINE_CARD) return { status: PaymentStatus.FAILURE, error: { code: "card_declined", message: "Your card was declined." } };
      if (req.authType === AuthenticationType.THREE_DS || pan === MOCK_3DS_CARD) {
        const txn = id();
        ledger.set(txn, { amount: req.amount, status: PaymentStatus.AUTHENTICATION_PENDING });
        return { status: PaymentStatus.AUTHENTICATION_PENDING, connectorTransactionId: txn, redirectionData: { url: req.returnUrl ?? "https://mock.test/3ds", method: "GET" } };
      }
      const txn = id();
      const status = req.captureMethod === CaptureMethod.MANUAL ? PaymentStatus.AUTHORIZED : PaymentStatus.CHARGED;
      ledger.set(txn, { amount: req.amount, status });
      return { status, connectorTransactionId: txn, amount: req.amount };
    },
    async capture(req) {
      const t = ledger.get(req.connectorTransactionId);
      if (!t) return { status: PaymentStatus.CAPTURE_FAILED, error: { code: "not_found", message: "unknown transaction" } };
      t.status = PaymentStatus.CHARGED;
      return { status: PaymentStatus.CHARGED, connectorTransactionId: req.connectorTransactionId, amount: req.amountToCapture };
    },
    async void(req) {
      const t = ledger.get(req.connectorTransactionId);
      if (!t) return { status: PaymentStatus.VOID_FAILED, error: { code: "not_found", message: "unknown transaction" } };
      t.status = PaymentStatus.VOIDED;
      return { status: PaymentStatus.VOIDED, connectorTransactionId: req.connectorTransactionId };
    },
    async refund(req) {
      const t = ledger.get(req.connectorTransactionId);
      if (!t) return { status: RefundStatus.REFUND_FAILURE, error: { code: "not_found", message: "unknown transaction" } };
      return { status: RefundStatus.REFUND_SUCCESS, connectorRefundId: `mock_re_${++seq}` };
    },
    async sync(req) {
      const t = ledger.get(req.connectorTransactionId);
      return t ? { status: t.status, connectorTransactionId: req.connectorTransactionId, amount: t.amount } : { status: PaymentStatus.UNSPECIFIED };
    },
  };
  return connector;
};
