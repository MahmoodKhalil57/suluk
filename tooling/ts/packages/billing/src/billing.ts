/**
 * Stripe wrappers (C046, v1) — customer + intent creation and the saved-card surface, over the injected {@link
 * StripeConfig}. Extracted from the source with the `res.ok` + field-presence + throw semantics PRESERVED VERBATIM; the
 * only deliberate change is dropping the Effect-`Schema` defensive response-decode (a robustness layer the app can
 * re-add) in favour of plain JSON access — so this package carries no `effect` dependency. The money-MOVING paths
 * (checkout, charge-off-session), the pricing-woven subscription logic (status/change), the webhook dispatch, the credit
 * grant, email, and the billing-account DB linking are NOT here — they stay in the app (the careful follow-on).
 */
import { type StripeConfig, stripePost, stripeGet, toForm } from "./transport";

type StripeErr = { error?: { message?: string } };

/** Create a Stripe customer for the user (the caller persists the id). */
export async function createCustomer(cfg: StripeConfig, email: string | null, userId: string): Promise<string> {
  const res = await stripePost(cfg, "customers", toForm({ email: email ?? undefined, metadata: { userId } }));
  const cust = (await res.json()) as StripeErr & { id?: string };
  if (!res.ok || !cust.id) throw new Error(cust.error?.message ?? `Stripe customer create failed (${res.status})`);
  return cust.id;
}

/** Create a $0 SetupIntent to vault a card without charging ("Add card"). Returns the client secret. */
export async function createSetupIntent(cfg: StripeConfig, customerId: string, userId: string): Promise<string> {
  const res = await stripePost(cfg, "setup_intents", toForm({ customer: customerId, automatic_payment_methods: { enabled: true }, usage: "off_session", metadata: { userId } }));
  const si = (await res.json()) as StripeErr & { client_secret?: string };
  if (!res.ok || si.error || !si.client_secret) throw new Error(si.error?.message ?? `Stripe setup_intent create failed (${res.status})`);
  return si.client_secret;
}

/** Create a PaymentIntent for an on-site one-time top-up (saves the card; the webhook credits it). Returns the client secret. */
export async function createPaymentIntent(cfg: StripeConfig, customerId: string, amountCents: number, meta: { userId: string; credits: number; taxCalculation?: string | null }): Promise<string> {
  const res = await stripePost(
    cfg,
    "payment_intents",
    toForm({
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      setup_future_usage: "off_session",
      metadata: { userId: meta.userId, credits: meta.credits, source: "onsite_topup", ...(meta.taxCalculation ? { tax_calculation: meta.taxCalculation } : {}) },
    }),
  );
  const pi = (await res.json()) as StripeErr & { client_secret?: string };
  if (!res.ok || pi.error || !pi.client_secret) throw new Error(pi.error?.message ?? `Stripe payment_intent create failed (${res.status})`);
  return pi.client_secret;
}

/** A buyer's tax location (from a saved card's billing address). */
export interface TaxAddress {
  country: string;
  state: string | null;
  postalCode: string | null;
  city: string | null;
  line1: string | null;
}

/** A payment method as the billing panel shows it — card + its billing address + whether it's the customer's default. */
export interface PaymentMethodWire {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  name: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  isDefault: boolean;
}

interface StripePmRaw {
  id: string;
  card?: { brand?: string; last4?: string; exp_month?: number; exp_year?: number };
  billing_details?: { name?: string | null; address?: { line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null } | null };
}

/** List a customer's saved cards (each with its billing address), marking the invoice default. */
export async function listPaymentMethods(cfg: StripeConfig, customerId: string): Promise<PaymentMethodWire[]> {
  const [pmRes, custRes] = await Promise.all([
    stripeGet(cfg, `payment_methods?customer=${customerId}&type=card&limit=20`),
    stripeGet(cfg, `customers/${customerId}`),
  ]);
  const list = (await pmRes.json()) as { data?: StripePmRaw[] };
  const cust = (await custRes.json()) as { invoice_settings?: { default_payment_method?: string | null } };
  const defaultId = cust?.invoice_settings?.default_payment_method ?? null;
  return (list.data ?? []).map((pm) => {
    const addr = pm.billing_details?.address ?? null;
    return {
      id: pm.id,
      brand: pm.card?.brand ?? "card",
      last4: pm.card?.last4 ?? "",
      expMonth: pm.card?.exp_month ?? 0,
      expYear: pm.card?.exp_year ?? 0,
      name: pm.billing_details?.name ?? null,
      line1: addr?.line1 ?? null,
      line2: addr?.line2 ?? null,
      city: addr?.city ?? null,
      region: addr?.state ?? null,
      postalCode: addr?.postal_code ?? null,
      country: addr?.country ?? null,
      isDefault: pm.id === defaultId,
    };
  });
}

/** The customer's DEFAULT saved card — its id (to charge) + its billing address (to locate tax). Graceful: a transient
 *  Stripe error returns null rather than blocking a top-up (this is only tax LOCATION / an off-session skip). */
export async function defaultCard(cfg: StripeConfig, customerId: string): Promise<{ pmId: string; address: TaxAddress | null } | null> {
  try {
    const cards = await listPaymentMethods(cfg, customerId);
    const d = cards.find((c) => c.isDefault);
    if (!d) return null;
    const address: TaxAddress | null = d.country ? { country: d.country, state: d.region, postalCode: d.postalCode, city: d.city, line1: d.line1 } : null;
    return { pmId: d.id, address };
  } catch {
    return null;
  }
}

/** The customer's default payment-method id (to charge off-session), or null. */
export async function defaultPaymentMethodId(cfg: StripeConfig, customerId: string): Promise<string | null> {
  return (await defaultCard(cfg, customerId))?.pmId ?? null;
}

/** Whether `pmId` belongs to `customerId` — guards set-default / detach against another customer's card. */
export async function ownsPaymentMethod(cfg: StripeConfig, customerId: string, pmId: string): Promise<boolean> {
  return (await listPaymentMethods(cfg, customerId)).some((m) => m.id === pmId);
}

/** Make `pmId` the customer's default payment method for invoices. */
export async function setDefaultPaymentMethod(cfg: StripeConfig, customerId: string, pmId: string): Promise<void> {
  const res = await stripePost(cfg, `customers/${customerId}`, toForm({ invoice_settings: { default_payment_method: pmId } }));
  if (!res.ok) throw new Error(`Stripe set-default failed (${res.status})`);
}

/** Point an ACTIVE subscription at `pmId` too, so changing the default card moves the recurring charge to it. */
export async function setSubscriptionDefaultCard(cfg: StripeConfig, subscriptionId: string, pmId: string): Promise<void> {
  const res = await stripePost(cfg, `subscriptions/${subscriptionId}`, toForm({ default_payment_method: pmId }));
  if (!res.ok) throw new Error(`Stripe subscription set-default-card failed (${res.status})`);
}

/** Detach (remove) a saved card from the customer. */
export async function detachPaymentMethod(cfg: StripeConfig, pmId: string): Promise<void> {
  const res = await stripePost(cfg, `payment_methods/${pmId}/detach`, toForm({}));
  if (!res.ok) throw new Error(`Stripe detach failed (${res.status})`);
}

/** Schedule the subscription to cancel at the period end (`cancel=true`) or resume it (`cancel=false`). */
export async function setSubscriptionCancel(cfg: StripeConfig, subscriptionId: string, cancel: boolean): Promise<void> {
  const res = await stripePost(cfg, `subscriptions/${subscriptionId}`, toForm({ cancel_at_period_end: cancel }));
  if (!res.ok) {
    const body = (await res.json()) as StripeErr;
    throw new Error(body?.error?.message ?? `Stripe subscription update failed (${res.status})`);
  }
}

/** Best-effort: if the subscription's latest invoice is still OPEN (a failed renewal), retry it NOW. No-op when there's
 *  nothing open to pay; never throws (a fix-billing flow must not 500 on the retry). */
export async function payOpenInvoice(cfg: StripeConfig, subscriptionId: string): Promise<void> {
  try {
    const res = await stripeGet(cfg, `subscriptions/${subscriptionId}?expand[]=latest_invoice`);
    if (!res.ok) return;
    const sub = (await res.json()) as { latest_invoice?: { id?: string; status?: string } };
    const inv = sub?.latest_invoice;
    if (!inv?.id || inv.status !== "open") return;
    await stripePost(cfg, `invoices/${inv.id}/pay`, toForm({}));
  } catch (e) {
    console.warn(`[billing] payOpenInvoice ${subscriptionId} failed:`, e instanceof Error ? e.message : String(e));
  }
}
