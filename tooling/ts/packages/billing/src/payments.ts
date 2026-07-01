/**
 * The money-MOVING Stripe primitives (C046, v2) — hosted Checkout (one-time + subscription), the billing portal, the
 * on-saved-card top-up PaymentIntent, and the OFF-SESSION auto-top-up charge with its decline/3DS handling. Pure Stripe
 * mechanics over the injected {@link StripeConfig}; the app supplies its product NAME + success/cancel/return URLs (no app
 * routes or branding baked in) and reads the returned secrets. Extracted verbatim with the source's res.ok / field /
 * throw semantics; plain typed JSON access (no Effect-Schema decode). The credit GRANT for these charges happens on the
 * Stripe webhook via @suluk/credits.grantOnce — app POLICY, not here.
 */
import { type StripeConfig, stripePost, toForm } from "./transport";
import { defaultPaymentMethodId } from "./billing";
import { paymentConnector, statusString } from "./agnostic";
import { PaymentStatus, CaptureMethod, AuthenticationType, Currency } from "@suluk/payments";
import type { SubPlan } from "./subscriptions";

type StripeErr = { error?: { message?: string; code?: string; payment_intent?: { id?: string; status?: string } } };

/** The metadata tag the webhook reads to decide whether (and how) to credit a PaymentIntent. */
export type TopupMeta = { userId: string; credits: number; taxCalculation?: string | null };

export interface CheckoutOpts {
  userId: string;
  /** the user's existing customer (reused so a saved card isn't orphaned), or null to let Checkout create one. */
  customerId: string | null;
  amountCents: number;
  credits: number;
  /** the URL Stripe returns to on success (the app composes it from its origin + route). */
  successUrl: string;
  cancelUrl: string;
  /** the line-item product name shown on the hosted page, e.g. "acme — 600 credits". */
  productName: string;
}

/** Create a Stripe Checkout Session (one-time top-up) — the hosted FALLBACK to the on-site Payment Element. Reuses the
 *  user's existing customer or has Checkout create one, captures the billing address, and saves the card for future
 *  off-session use. Returns the hosted checkout URL. */
export async function createCheckout(cfg: StripeConfig, o: CheckoutOpts): Promise<string> {
  const form = toForm({
    mode: "payment",
    success_url: o.successUrl,
    cancel_url: o.cancelUrl,
    client_reference_id: o.userId,
    customer: o.customerId ?? undefined,
    customer_creation: o.customerId ? undefined : "always",
    // Capture the billing address WITH the card → Stripe stores it on the PaymentMethod (no separate table; no shipping).
    billing_address_collection: "required",
    // Stripe Tax on the charge; customer_update.address:auto saves the collected address to an EXISTING customer so the tax
    // location resolves. $0 until registered, then auto-collects.
    automatic_tax: { enabled: true },
    customer_update: o.customerId ? { address: "auto" } : undefined,
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: o.amountCents, product_data: { name: o.productName } } }],
    metadata: { userId: o.userId, credits: o.credits },
    // setup_future_usage saves the card. NO `source` here, so payment_intent.succeeded skips this PI — a Checkout charge
    // is credited via checkout.session.completed, never twice.
    payment_intent_data: { metadata: { userId: o.userId, credits: o.credits }, setup_future_usage: "off_session" },
  });
  const res = await stripePost(cfg, "checkout/sessions", form);
  const session = (await res.json()) as StripeErr & { url?: string };
  if (!res.ok || !session.url) throw new Error(session.error?.message ?? `Stripe checkout failed (${res.status})`);
  return session.url;
}

export interface SubscriptionCheckoutOpts {
  userId: string;
  plan: SubPlan;
  successUrl: string;
  cancelUrl: string;
  /** the line-item product name shown on the hosted page, e.g. "acme — Pro". */
  productName: string;
}

/** Stripe Checkout in SUBSCRIPTION mode (recurring). subscription_data.metadata carries who + how many credits/cycle. */
export async function createSubscriptionCheckout(cfg: StripeConfig, o: SubscriptionCheckoutOpts): Promise<string> {
  const form = toForm({
    mode: "subscription",
    success_url: o.successUrl,
    cancel_url: o.cancelUrl,
    client_reference_id: o.userId,
    billing_address_collection: "required",
    line_items: [
      { quantity: 1, price_data: { currency: "usd", unit_amount: o.plan.priceCents, recurring: { interval: "month" }, product_data: { name: o.productName } } },
    ],
    subscription_data: { metadata: { userId: o.userId, credits: o.plan.credits, planId: o.plan.id } },
    automatic_tax: { enabled: true },
    metadata: { userId: o.userId },
  });
  const res = await stripePost(cfg, "checkout/sessions", form);
  const session = (await res.json()) as StripeErr & { url?: string };
  if (!res.ok || !session.url) throw new Error(session.error?.message ?? `Stripe subscription checkout failed (${res.status})`);
  return session.url;
}

/** Open the Stripe billing portal (manage/cancel) for an existing customer. Returns the URL; throws on a Stripe error. */
export async function createPortalSessionForCustomer(cfg: StripeConfig, customerId: string, returnUrl: string): Promise<string> {
  const res = await stripePost(cfg, "billing_portal/sessions", toForm({ customer: customerId, return_url: returnUrl }));
  const session = (await res.json()) as StripeErr & { url?: string };
  if (!res.ok || !session.url) throw new Error(`Stripe billing portal failed (${res.status})`);
  return session.url;
}

/** Create a PaymentIntent on the customer's SAVED DEFAULT card — the one-click top-up path. The server resolves the
 *  default payment method (client can't inject one), pins the PI to it, and returns the client secret; the browser
 *  confirms (3DS in-page if needed). Returns null when there's no default card to charge. No setup_future_usage — the
 *  card is already saved. */
export async function createPaymentIntentOnDefaultCard(cfg: StripeConfig, customerId: string, amountCents: number, meta: TopupMeta): Promise<string | null> {
  const pmId = await defaultPaymentMethodId(cfg, customerId);
  if (!pmId) return null;
  const res = await stripePost(
    cfg,
    "payment_intents",
    toForm({
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      payment_method: pmId,
      payment_method_types: ["card"],
      metadata: { userId: meta.userId, credits: meta.credits, source: "onsite_topup", ...(meta.taxCalculation ? { tax_calculation: meta.taxCalculation } : {}) },
    }),
  );
  const pi = (await res.json()) as StripeErr & { client_secret?: string };
  if (!res.ok || pi.error || !pi.client_secret) throw new Error(pi.error?.message ?? `Stripe payment_intent create failed (${res.status})`);
  return pi.client_secret;
}

/** An OFF-SESSION charge on a saved card (auto-top-up). Confirms immediately; metadata carries who + credits + `source`
 *  so the payment_intent.succeeded webhook credits idempotently on the SAME `pi:<id>` key. Returns the PaymentIntent id +
 *  status, plus `authRequired` when the card needs 3DS (a decline to NOTIFY, not throw on). A hard 402 card decline is
 *  also returned (not thrown) so the caller can alert; a transient/transport failure throws (it may recover). */
export async function chargeOffSession(
  cfg: StripeConfig,
  customerId: string,
  pmId: string,
  amountCents: number,
  meta: TopupMeta,
): Promise<{ id: string | null; status: string | null; authRequired: boolean }> {
  // C048 — routed through @suluk/payments (Stripe today, swappable). The connector emits the SAME off-session PI request
  // (amount/currency/customer/payment_method/off_session/confirm + the app metadata) and returns the unified status; we
  // map it back to billing's `{ id, status, authRequired }` shape, preserving the decline taxonomy: a 3DS decline
  // (AUTHENTICATION_PENDING) sets `authRequired` (email the user), a hard card decline (FAILURE) is RETURNED not thrown
  // (raise the alert), and a transport/unexpected error still THROWS (from the connector). A fresh idempotency key per
  // call (unique merchantTransactionId) preserves the original's "every call is a new charge" behaviour.
  const res = await paymentConnector(cfg).authorize({
    merchantTransactionId: crypto.randomUUID(),
    amount: { minorAmount: amountCents, currency: Currency.USD },
    captureMethod: CaptureMethod.AUTOMATIC,
    paymentMethod: { token: { value: pmId } },
    authType: AuthenticationType.NO_THREE_DS,
    customerId,
    offSession: true,
    metadata: { userId: meta.userId, credits: String(meta.credits), source: "auto_topup", ...(meta.taxCalculation ? { tax_calculation: meta.taxCalculation } : {}) },
  });
  const authRequired = res.status === PaymentStatus.AUTHENTICATION_PENDING;
  return { id: res.connectorTransactionId ?? null, status: statusString(res.status), authRequired };
}
