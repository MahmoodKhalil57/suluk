/**
 * Subscription mechanics (C046, v2) — the recurring-billing logic, made generic over a {@link SubPlan} shape so the
 * pricing MATRIX stays in the app (it owns COGS/markup/tier discounts) while the Stripe wiring lives here. The app passes
 * its plan catalog (`SubPlan[]`) + a branding seam; the package owns find-or-create pricing, the create-on-default-card
 * one-click path, live status, and the in-place plan CHANGE with its paid-CEILING semantics. Extracted verbatim with the
 * source's res.ok / field semantics; plain typed JSON access (no Effect-Schema decode). The webhook DISPATCH that grants
 * the cycle's credits on `invoice.paid` is app POLICY (it composes @suluk/credits.grantOnce + these primitives).
 */
import { type StripeConfig, stripePost, stripeGet, toForm } from "./transport";
import { defaultPaymentMethodId } from "./billing";

/** A subscription plan as the app prices it — generic shape; the app derives `priceCents`/`credits` from its COGS model. */
export interface SubPlan {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  label: string;
}

/** The app's plan whose id is `id`, or undefined — the generic lookup the orchestrators use against the injected catalog. */
export const planById = (plans: SubPlan[], id: string): SubPlan | undefined => plans.find((p) => p.id === id);

/** The plan whose monthly price is exactly `priceCents` (each tier has a distinct price), or undefined — maps a live
 *  Stripe item price back to a plan (e.g. resolving the paid-ceiling plan). */
export const planByPrice = (plans: SubPlan[], priceCents: number): SubPlan | undefined => plans.find((p) => p.priceCents === priceCents);

/** Branding seam for the Stripe Product/Price a plan creates — app-controlled so find-or-create stays stable + on-brand. */
export interface SubscriptionBranding {
  /** the recurring Price's product name; default `${plan.name} (monthly)`. */
  productName?: (plan: SubPlan) => string;
  /** the lookup_key PREFIX that makes find-or-create idempotent across repricing; default "sub". KEEP STABLE per app. */
  lookupKeyPrefix?: string;
}

type StripeErr = { error?: { message?: string } };
interface SubItem {
  id?: string;
  current_period_end?: number;
  price?: { unit_amount?: number };
}
interface SubObject {
  id?: string;
  status?: string;
  items?: { data?: SubItem[] };
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, string>;
  latest_invoice?: { status?: string; confirmation_secret?: { client_secret?: string }; payment_intent?: { client_secret?: string } };
  error?: { message?: string };
}

/** Find (by lookup_key) or create the recurring Stripe Price for a plan. The lookup_key embeds the price + credits, so a
 *  repricing mints a FRESH price rather than reusing a stale one. Returns the price id. */
export async function ensurePlanPrice(cfg: StripeConfig, plan: SubPlan, branding?: SubscriptionBranding): Promise<string> {
  const prefix = branding?.lookupKeyPrefix ?? "sub";
  const productName = branding?.productName ?? ((p: SubPlan) => `${p.name} (monthly)`);
  const lookupKey = `${prefix}_${plan.id}_${plan.priceCents}_${plan.credits}_m`;
  const found = (await (await stripeGet(cfg, `prices?lookup_keys[0]=${lookupKey}&active=true&limit=1`)).json()) as { data?: { id?: string }[] };
  if (found?.data?.[0]?.id) return found.data[0].id;
  const prodRes = await stripePost(cfg, "products", toForm({ name: productName(plan) }));
  const product = (await prodRes.json()) as StripeErr & { id?: string };
  if (!prodRes.ok || !product.id) throw new Error(product.error?.message ?? `Stripe product create failed (${prodRes.status})`);
  const priceRes = await stripePost(
    cfg,
    "prices",
    toForm({ product: product.id, currency: "usd", unit_amount: plan.priceCents, recurring: { interval: "month" }, lookup_key: lookupKey }),
  );
  const price = (await priceRes.json()) as StripeErr & { id?: string };
  if (!priceRes.ok || !price.id) throw new Error(price.error?.message ?? `Stripe price create failed (${priceRes.status})`);
  return price.id;
}

/** Create a subscription ON the saved default card (one-click). payment_behavior=default_incomplete leaves the first
 *  invoice unpaid with a PaymentIntent the browser confirms (confirmCardPayment → 3DS in-page) → the subscription
 *  activates → invoice.paid grants the cycle's credits. Returns the first invoice's client secret + the subscription id,
 *  or null when there's no default card. */
export async function createSubscriptionOnDefaultCard(
  cfg: StripeConfig,
  customerId: string,
  plan: SubPlan,
  userId: string,
  branding?: SubscriptionBranding,
): Promise<{ clientSecret: string; subscriptionId: string } | null> {
  const pmId = await defaultPaymentMethodId(cfg, customerId);
  if (!pmId) return null;
  const price = await ensurePlanPrice(cfg, plan, branding);
  const res = await stripePost(
    cfg,
    "subscriptions",
    toForm({
      customer: customerId,
      items: [{ price }],
      default_payment_method: pmId,
      payment_behavior: "default_incomplete",
      // Stripe Tax computes + adds tax to each invoice automatically (from the saved card's billing address). $0 until the
      // account has a head-office address + active tax registrations, then starts collecting with no code change.
      automatic_tax: { enabled: true },
      // `confirmation_secret` is the current field (Stripe ≥ 2025-03-31 removed `invoice.payment_intent`); `payment_intent`
      // is still read below as a fallback for accounts pinned to an older API version.
      expand: ["latest_invoice.confirmation_secret"],
      metadata: { userId, credits: plan.credits, planId: plan.id },
    }),
  );
  const sub = (await res.json()) as SubObject;
  if (!res.ok || sub.error || !sub.id) throw new Error(sub.error?.message ?? `Stripe subscription create failed (${res.status})`);
  const clientSecret = sub.latest_invoice?.confirmation_secret?.client_secret ?? sub.latest_invoice?.payment_intent?.client_secret;
  if (!clientSecret) throw new Error("Stripe subscription created without a first-invoice client secret");
  return { clientSecret, subscriptionId: sub.id };
}

/** The "paid ceiling" for the CURRENT cycle = the highest plan price already CHARGED this cycle. Persisted in subscription
 *  metadata (raised on each above-ceiling upgrade), guarded by the period end so it auto-resets at the next renewal. Falls
 *  back to the current item price — a defer-change lowers the item price (for next cycle's billing) but NOT the ceiling, so
 *  a later change to ANY plan ≤ the ceiling stays free (you already paid for that level); only EXCEEDING it charges. PURE. */
export const ceilingFor = (metadata: Record<string, string> | undefined, periodEndSec: number, currentPriceCents: number): number => {
  const stored = Number(metadata?.cycleCeilingCents ?? 0);
  const storedEnd = Number(metadata?.cycleCeilingEnd ?? 0);
  return stored > 0 && storedEnd === periodEndSec ? Math.max(stored, currentPriceCents) : currentPriceCents;
};

/** The user's CURRENT subscription as the UI needs it (plan + status + period end + pending-cancel + the cycle's paid
 *  ceiling), or null when there's no live subscription. Live state from Stripe; `plans` is the app catalog for the
 *  price fallback when the live item lacks one. */
export interface SubscriptionStatus {
  planId: string | null;
  status: string;
  currentPeriodEnd: number; // ms epoch
  cancelAtPeriodEnd: boolean;
  paidCeilingCents: number; // highest plan price charged this cycle — a change ≤ this defers to next cycle (no charge)
}
export async function getSubscriptionStatus(cfg: StripeConfig, subscriptionId: string, plans: SubPlan[]): Promise<SubscriptionStatus | null> {
  const res = await stripeGet(cfg, `subscriptions/${subscriptionId}`);
  if (!res.ok) return null;
  const sub = (await res.json()) as SubObject;
  if (!sub?.status || !["active", "trialing", "past_due"].includes(sub.status)) return null; // not a live plan
  const item = sub.items?.data?.[0];
  const periodEnd = sub.current_period_end ?? item?.current_period_end ?? 0;
  const currentPriceCents = item?.price?.unit_amount ?? planById(plans, sub.metadata?.planId ?? "")?.priceCents ?? 0;
  return {
    planId: sub.metadata?.planId ?? null,
    status: sub.status,
    currentPeriodEnd: periodEnd * 1000,
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    paidCeilingCents: ceilingFor(sub.metadata, periodEnd, currentPriceCents),
  };
}

/** Change the subscriber's plan IN PLACE against the cycle's PAID CEILING (see {@link ceilingFor}). ABOVE the ceiling = an
 *  upgrade: immediate + prorated for the difference ABOVE THE CEILING, charged off-session; the matching prorated credits
 *  land on that invoice.paid (3DS-safe). AT OR BELOW the ceiling = a deferred change: no charge + no new credits now — it
 *  re-prices for the NEXT renewal (so up→down→up within a cycle never re-charges). Returns the kind, the period end, and a
 *  clientSecret ONLY when the upgrade's prorated charge needs in-page 3DS. `plans` is the app catalog. */
export interface ChangePlanResult {
  kind: "upgrade" | "downgrade";
  clientSecret: string | null;
  currentPeriodEnd: number; // ms epoch
}
export async function changeSubscriptionPlan(
  cfg: StripeConfig,
  subscriptionId: string,
  newPlan: SubPlan,
  userId: string,
  plans: SubPlan[],
  branding?: SubscriptionBranding,
): Promise<ChangePlanResult> {
  const getRes = await stripeGet(cfg, `subscriptions/${subscriptionId}`);
  const current = (await getRes.json()) as SubObject;
  const item = current?.items?.data?.[0];
  if (!getRes.ok || !item?.id) throw new Error(current?.error?.message ?? `Stripe subscription retrieve failed (${getRes.status})`);
  const currentPriceCents = item.price?.unit_amount ?? planById(plans, current?.metadata?.planId ?? "")?.priceCents ?? 0;
  if (currentPriceCents <= 0) throw new Error("Could not determine the current plan price"); // don't guess "upgrade" + charge
  const periodEndSec = current?.current_period_end ?? item.current_period_end ?? 0;
  const periodEnd = periodEndSec * 1000;
  const wasScheduledToCancel = current?.cancel_at_period_end === true; // switching plans on a canceling sub means "keep it"

  // Decide against the PAID CEILING, not the current price: a prior defer-downgrade lowers the item price but not the
  // ceiling, so going back UP to a plan you already paid for this cycle must NOT re-charge.
  const ceilingCents = ceilingFor(current?.metadata, periodEndSec, currentPriceCents);
  const isUpgrade = newPlan.priceCents > ceilingCents;
  const newCeiling = Math.max(ceilingCents, newPlan.priceCents); // an upgrade raises it; a deferred change preserves it
  const newPriceId = await ensurePlanPrice(cfg, newPlan, branding);

  // EXCEEDING the ceiling after a prior defer-downgrade left the item BELOW it: first bump the item up to the ceiling price
  // with NO proration, so Stripe measures the upgrade proration from the CEILING (newPlan − ceiling), not from the lower
  // current price. No-op when current == ceiling.
  if (isUpgrade && currentPriceCents < ceilingCents) {
    const ceilingPlan = planByPrice(plans, ceilingCents);
    if (ceilingPlan) {
      const ceilingPriceId = await ensurePlanPrice(cfg, ceilingPlan, branding);
      const bump = await stripePost(
        cfg,
        `subscriptions/${subscriptionId}`,
        toForm({ items: [{ id: item.id, price: ceilingPriceId }], proration_behavior: "none" }),
      );
      if (!bump.ok) console.warn(`[billing] couldn't bump sub ${subscriptionId} to the ceiling before upgrade (http ${bump.status})`);
    }
  }

  const res = await stripePost(
    cfg,
    `subscriptions/${subscriptionId}`,
    toForm({
      items: [{ id: item.id, price: newPriceId }], // re-price the SAME item (don't add a second line)
      proration_behavior: isUpgrade ? "always_invoice" : "none", // above ceiling bills the diff now; ≤ ceiling waits for renewal
      // pending_if_incomplete holds the UPGRADE as a pending change until its prorated charge is actually paid — so an
      // abandoned/declined 3DS never moves the user to the higher plan without collecting. (Deferred changes don't charge.)
      payment_behavior: isUpgrade ? "pending_if_incomplete" : undefined,
      // (re)assert Stripe Tax only on a DEFERRED change. NOT on an upgrade: pending_if_incomplete REJECTS automatic_tax as
      // an unsupported param (a hard 400); a sub created after the Tax wiring already has it enabled from subscribe.
      automatic_tax: isUpgrade ? undefined : { enabled: true },
      // cycleCeiling{Cents,End}: the paid ceiling for this cycle — an upgrade raises it to newPlan, a deferred change keeps
      // it (so a later re-change ≤ it stays free); the End stamp lets it auto-reset at the next renewal.
      metadata: { userId, planId: newPlan.id, credits: newPlan.credits, cycleCeilingCents: newCeiling, cycleCeilingEnd: periodEndSec },
      expand: ["latest_invoice.confirmation_secret"],
    }),
  );
  const sub = (await res.json()) as SubObject;
  if (!res.ok || sub.error || !sub.id) throw new Error(sub.error?.message ?? `Stripe plan change failed (${res.status})`);

  // A plan change on a subscription that was scheduled to cancel means the user wants to KEEP it → un-schedule the
  // cancellation. A SEPARATE update because cancel_at_period_end is NOT a supported pending-update param (it would 400 the
  // upgrade re-price). Best-effort: the plan change already succeeded, so a resume failure is logged, never thrown.
  if (wasScheduledToCancel) {
    const resumeRes = await stripePost(cfg, `subscriptions/${subscriptionId}`, toForm({ cancel_at_period_end: false }));
    if (!resumeRes.ok) console.warn(`[billing] plan change couldn't resume cancel-scheduled sub ${subscriptionId} (http ${resumeRes.status})`);
  }

  const inv = sub.latest_invoice;
  const needsAction = isUpgrade && inv?.status !== "paid"; // off-session success → status "paid" → no in-page step
  const clientSecret = needsAction ? (inv?.confirmation_secret?.client_secret ?? inv?.payment_intent?.client_secret ?? null) : null;
  return { kind: isUpgrade ? "upgrade" : "downgrade", clientSecret, currentPeriodEnd: periodEnd };
}
