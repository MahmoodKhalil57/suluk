/**
 * The agnostic payment bridge (C048) — billing's server-side charge + customer paths now run through @suluk/payments
 * (Stripe today, swappable by construction) instead of hand-rolled Stripe calls. This is the first step of deprecating
 * the direct @suluk/stripe coupling: `createCustomer` + `chargeOffSession` are re-expressed over the unified
 * {@link PaymentConnector}; the browser/Element/hosted-Checkout + subscription flows stay direct for now (they need the
 * client-token surface — the follow-on migration). Parity-tested: the agnostic path emits the same Stripe request and
 * preserves the off-session decline taxonomy.
 */
import { stripeConnector, PaymentStatus, type PaymentConnector } from "@suluk/payments";
import type { StripeConfig } from "./transport";

/** The payment connector bound to this billing config. Stripe now; changing the backend is a one-line swap here. */
export function paymentConnector(cfg: StripeConfig): PaymentConnector {
  return stripeConnector({ apiKey: { value: cfg.secretKey } }, { fetch: cfg.fetch });
}

/** Map a unified PaymentStatus back to the Stripe-ish status STRING billing's callers already branch on ("succeeded" /
 *  "requires_action" / "processing" / "failed"), so the rewire is drop-in for the existing auto-top-up flow. */
const STATUS_STRING: Partial<Record<PaymentStatus, string>> = {
  [PaymentStatus.CHARGED]: "succeeded",
  [PaymentStatus.AUTHORIZED]: "requires_capture",
  [PaymentStatus.AUTHENTICATION_PENDING]: "requires_action",
  [PaymentStatus.PENDING]: "processing",
  [PaymentStatus.FAILURE]: "failed",
};
export const statusString = (s: PaymentStatus): string => STATUS_STRING[s] ?? "failed";
