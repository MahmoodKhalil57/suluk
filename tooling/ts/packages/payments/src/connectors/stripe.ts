/**
 * The built-in Stripe connector (C048) — the first real backend for the agnostic {@link PaymentConnector}. It translates
 * the unified schema to Stripe's REST API (`fetch` over `x-www-form-urlencoded`, Workers-native — no `stripe` SDK, no
 * native deps) and maps Stripe's response back to the integer-exact unified {@link PaymentStatus}/{@link RefundStatus}.
 * The status MAPPING is the load-bearing, parity-critical part (a wrong mapping silently mis-reports a charge), so every
 * arm is witnessed. Soft declines come back IN-BAND as `FAILURE`/`AUTHENTICATION_PENDING`; only transport/unexpected
 * errors throw (Prism's contract).
 */
import type { ConnectorAuth, ConnectorFactory, HttpOptions, PaymentConnector } from "../connector";
import { ConnectorError, IntegrationError, NetworkError } from "../errors";
import { PaymentStatus, RefundStatus, CaptureMethod, type PaymentResponse, type RefundResponse, type MinorAmount } from "../types";

const BASE = "https://api.stripe.com/v1";

/** Recursive form encoder for Stripe's bracket-nested `x-www-form-urlencoded` (metadata[k], card[number], …). */
function toForm(obj: Record<string, unknown>, prefix = "", out = new URLSearchParams()): URLSearchParams {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object" && !Array.isArray(v)) toForm(v as Record<string, unknown>, key, out);
    else out.append(key, String(v));
  }
  return out;
}

interface StripePi {
  id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  next_action?: { redirect_to_url?: { url?: string } };
  last_payment_error?: { code?: string; message?: string; decline_code?: string };
}
interface StripeErr {
  error?: { type?: string; code?: string; message?: string; decline_code?: string; payment_intent?: StripePi };
}

/** Stripe PaymentIntent.status → the unified PaymentStatus (the parity table). */
function mapPiStatus(s: string | undefined): PaymentStatus {
  switch (s) {
    case "succeeded": return PaymentStatus.CHARGED;
    case "requires_capture": return PaymentStatus.AUTHORIZED;
    case "requires_action":
    case "requires_confirmation": return PaymentStatus.AUTHENTICATION_PENDING;
    case "processing": return PaymentStatus.PENDING;
    case "canceled": return PaymentStatus.VOIDED;
    case "requires_payment_method": return PaymentStatus.FAILURE; // the (initial) attempt didn't succeed
    default: return PaymentStatus.UNRESOLVED;
  }
}

/** Stripe Refund.status → the unified RefundStatus. */
function mapRefundStatus(s: string | undefined): RefundStatus {
  switch (s) {
    case "succeeded": return RefundStatus.REFUND_SUCCESS;
    case "pending":
    case "requires_action": return RefundStatus.REFUND_PENDING;
    case "failed":
    case "canceled": return RefundStatus.REFUND_FAILURE;
    default: return RefundStatus.UNSPECIFIED;
  }
}

/** Build the unified PaymentResponse from a Stripe PI (the success/redirect arm). */
function piToResponse(pi: StripePi): PaymentResponse {
  const status = mapPiStatus(pi.status);
  const res: PaymentResponse = { status, connectorTransactionId: pi.id };
  if (status === PaymentStatus.AUTHENTICATION_PENDING && pi.next_action?.redirect_to_url?.url) {
    res.redirectionData = { url: pi.next_action.redirect_to_url.url, method: "GET" };
  }
  if (pi.amount != null && pi.currency) res.amount = { minorAmount: pi.amount, currency: pi.currency.toUpperCase() };
  return res;
}

export const stripeConnector: ConnectorFactory = (auth: ConnectorAuth, http?: HttpOptions): PaymentConnector => {
  const secret = auth.apiKey?.value;
  if (!secret) throw new IntegrationError("INVALID_CONFIGURATION", "stripe connector needs { apiKey: { value } }");
  const doFetch = http?.fetch ?? fetch;

  async function call(path: string, form: URLSearchParams | null, idempotencyKey?: string): Promise<{ ok: boolean; status: number; json: StripePi & StripeErr }> {
    let res: Response;
    try {
      res = await doFetch(`${BASE}/${path}`, {
        method: form ? "POST" : "GET",
        headers: {
          authorization: `Bearer ${secret}`,
          ...(form ? { "content-type": "application/x-www-form-urlencoded" } : {}),
          ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
        },
        body: form ? form.toString() : undefined,
      });
    } catch (e) {
      throw new NetworkError("CONNECT_TIMEOUT", e instanceof Error ? e.message : String(e));
    }
    const json = (await res.json().catch(() => ({}))) as StripePi & StripeErr;
    return { ok: res.ok, status: res.status, json };
  }

  return {
    name: "stripe",

    async authorize(req) {
      const form: Record<string, unknown> = {
        amount: req.amount.minorAmount,
        currency: req.amount.currency.toLowerCase(),
        capture_method: req.captureMethod === CaptureMethod.MANUAL ? "manual" : "automatic",
        confirm: true,
        customer: req.customerId,
        off_session: req.offSession ? true : undefined,
        setup_future_usage: req.setupFutureUsage ? "off_session" : undefined,
        return_url: req.returnUrl,
        metadata: { merchantTransactionId: req.merchantTransactionId, ...req.metadata },
      };
      const token = req.paymentMethod.token?.value; // a saved/vaulted payment method id (Secret)
      if (token) {
        form.payment_method = token; // a saved/vaulted payment method id
      } else if (req.paymentMethod.card) {
        const c = req.paymentMethod.card;
        form.payment_method_data = { type: "card", card: { number: c.cardNumber.value, exp_month: c.cardExpMonth.value, exp_year: c.cardExpYear.value, cvc: c.cardCvc.value } };
      } else {
        throw new IntegrationError("MISSING_REQUIRED_FIELD", "authorize needs paymentMethod.card or paymentMethod.token");
      }
      // the merchant txn id is the idempotency key — a retry of the SAME logical charge never double-charges.
      const { ok, status, json } = await call("payment_intents", toForm(form), `auth:${req.merchantTransactionId}`);
      if (ok) return piToResponse(json);
      // error arm: an off-session 3DS decline carries the PI (→ AUTHENTICATION_PENDING); a card decline is an in-band
      // FAILURE (Stripe returns HTTP 402 / `type: card_error` for these — an EXPECTED card outcome, not a transport
      // failure); anything else (4xx config error, 5xx, network) THROWS as a ConnectorError.
      const err = json.error;
      if (err?.code === "authentication_required" && err.payment_intent) {
        return { status: PaymentStatus.AUTHENTICATION_PENDING, connectorTransactionId: err.payment_intent.id, error: { code: err.code, message: err.message } };
      }
      if (status === 402 || err?.type === "card_error") {
        return { status: PaymentStatus.FAILURE, connectorTransactionId: err?.payment_intent?.id, error: { code: err?.decline_code ?? err?.code, message: err?.message } };
      }
      throw new ConnectorError(err?.code ?? "stripe_error", err?.message ?? `Stripe authorize failed (HTTP ${status})`);
    },

    async capture(req) {
      const { ok, json } = await call(`payment_intents/${req.connectorTransactionId}/capture`, toForm({ amount_to_capture: req.amountToCapture.minorAmount }));
      if (!ok) return { status: PaymentStatus.CAPTURE_FAILED, connectorTransactionId: req.connectorTransactionId, error: { code: json.error?.code, message: json.error?.message } };
      return piToResponse(json);
    },

    async void(req) {
      const { ok, json } = await call(`payment_intents/${req.connectorTransactionId}/cancel`, toForm({ cancellation_reason: "requested_by_customer" }));
      if (!ok) return { status: PaymentStatus.VOID_FAILED, connectorTransactionId: req.connectorTransactionId, error: { code: json.error?.code, message: json.error?.message } };
      return piToResponse(json);
    },

    async refund(req) {
      const { ok, json } = await call("refunds", toForm({ payment_intent: req.connectorTransactionId, amount: req.refundAmount.minorAmount }), `refund:${req.merchantRefundId}`);
      const r = json as { id?: string; status?: string } & StripeErr;
      if (!ok) return { status: RefundStatus.REFUND_FAILURE, error: { code: r.error?.code, message: r.error?.message } };
      return { status: mapRefundStatus(r.status), connectorRefundId: r.id };
    },

    async sync(req) {
      const { ok, json } = await call(`payment_intents/${req.connectorTransactionId}`, null);
      if (!ok) return { status: PaymentStatus.UNRESOLVED, connectorTransactionId: req.connectorTransactionId, error: { code: json.error?.code, message: json.error?.message } };
      return piToResponse(json);
    },

    async createCustomer(req) {
      const { ok, json } = await call("customers", toForm({ email: req.email, metadata: req.metadata }));
      const c = json as { id?: string } & StripeErr;
      if (!ok || !c.id) throw new ConnectorError(c.error?.code ?? "stripe_error", c.error?.message ?? "Stripe customer create failed");
      return { customerId: c.id };
    },
  };
};

/** exported for tests + reuse. */
export const _stripeInternals = { mapPiStatus, mapRefundStatus, toForm };
export type { MinorAmount };
