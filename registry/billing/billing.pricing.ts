/**
 * The billing PRICING policy (Suluk registry: `billing`) — APP-OWNED (C052: pricing is app policy, not a package). The
 * money math the app controls: the credit-COGS → markup → subsidy model, the DERIVED one-time packs + subscription plans,
 * the "pay X → get Y credits" acquisition function (net of Stripe's cut), and the credit-refund (buyback) pricing. Ported
 * from the toolfactory oracle (`api/src/pricing.ts`) verbatim in its math, generalised only in its product `label`s. The
 * Stripe MECHANICS (checkout, subscriptions, tax, refund HTTP) stay in `@suluk/billing`; this file is the pricing MATRIX
 * the subscription/checkout primitives are woven over — kept in the app so it owns COGS/markup/tier discounts.
 *
 * Delivered to `src/pricing.ts`; the billing service + routes import it from `../pricing`.
 */
import type { SubPlan } from "@suluk/billing";

// ── The two knobs — everything else derived, so prices can't be set arbitrarily or below cost ─────────────────────────
//
//   credit COGS (µ$)  ── what honoring 1 credit costs us (the @suluk/cost projection).
//   MARKUP_PCT        ── markup over COGS → the retail price we charge per credit.
//   SUB_TIER_DISCOUNT ── subscribers' per-credit DISCOUNT off retail, PER TIER. A markup % and a discount % do NOT cancel
//                        ((1+m)(1−s) ≠ 1); each tier's subsidized price still stays ≥ COGS (audit it in your cost gate).

export const CREDIT_COGS_MICROUSD = 450; // µ$ per credit (app COGS projection)
export const MARKUP_PCT = 73; // ~ $0.033/credit ⇒ $20 ≈ 600 credits

/** Retail price per credit (µ$) = COGS marked up — what a one-time top-up pays. */
export const creditPriceMicroUsd = Math.round(CREDIT_COGS_MICROUSD * (1 + MARKUP_PCT));

// Subscriber discount off the retail credit price, PER TIER — DEEPER on the pricier plans, so the most expensive plan is
// the best value per credit. Each tier's resulting price stays far above COGS.
export const SUB_TIER_DISCOUNT: Record<string, number> = { starter: 0.2, pro: 0.27, max: 0.33 };
/** The subsidized per-credit price (µ$) at a given discount off retail. */
const subPriceAt = (discount: number): number => Math.round(creditPriceMicroUsd * (1 - discount));
/** The LOWEST subscriber per-credit price (the deepest tier discount) — the conservative value the ≥COGS audit checks. */
export const subCreditPriceMicroUsd = subPriceAt(Math.max(...Object.values(SUB_TIER_DISCOUNT)));

const creditsFor = (priceCents: number, perCreditMicroUsd: number): number =>
  Math.round((priceCents * 10_000) / perCreditMicroUsd / 10) * 10; // round to 10

// Payment-provider cost (Stripe US online-card pricing: 2.9% + 30¢). We DON'T add it as a separate line; instead EVERY
// purchase grants credits on the NET that actually lands after Stripe's cut. So "pay X → get Y" is the whole story: the
// price the user sees is the price they pay, and the platform never eats the processing fee.
export const PROVIDER_FEE_PCT = 0.029;
export const PROVIDER_FEE_FLAT_CENTS = 30;
/** The ACTUAL Stripe cut on a charge of `chargeCents`, in cents — `ceil` so we never under-estimate what Stripe keeps. */
export const stripeCutCents = (chargeCents: number): number => Math.ceil(PROVIDER_FEE_PCT * chargeCents + PROVIDER_FEE_FLAT_CENTS);

/**
 * The ONE "pay X → get Y credits" function behind every acquisition path (top-up, pack, subscription): credits a
 * `chargeCents` payment buys at `perCreditMicroUsd`, AFTER netting Stripe's cut. Y bakes in COGS + markup + the tier
 * discount (all in the rate) and the processing fee (the netting). Tax, when enabled, stays a SEPARATE on-top line.
 */
export const creditsForCharge = (chargeCents: number, perCreditMicroUsd: number): number =>
  creditsFor(Math.max(0, chargeCents - stripeCutCents(chargeCents)), perCreditMicroUsd);

/** Credits a CUSTOM one-time USD charge buys (the "Add credits" dialog), at the retail rate, net of Stripe's cut. Server-authoritative. */
export const creditsForUsd = (cents: number): number => creditsForCharge(cents, creditPriceMicroUsd);

// ── Derived one-time packs + subscription plans ───────────────────────────────────────────────────────────────────

export interface CreditPack {
  id: string;
  credits: number;
  priceCents: number;
  label: string;
}
const pack = (id: string, priceCents: number): CreditPack => {
  const credits = creditsForCharge(priceCents, creditPriceMicroUsd); // retail rate, net of Stripe's cut
  return { id, credits, priceCents, label: `${credits} credits` };
};
/** One-time top-up packs (round prices; credits derived from the marked-up COGS). */
export const CREDIT_PACKS: CreditPack[] = [pack("starter", 500), pack("pro", 2000), pack("max", 5000)];
export const packById = (id: string): CreditPack | undefined => CREDIT_PACKS.find((p) => p.id === id);

// SubPlan is the @suluk/billing shape (id · name · credits · priceCents · label) — the subscription primitives are generic
// over it, so the pricing MATRIX (which tiers exist + how each is priced) lives here in the app.
const plan = (id: string, name: string, priceCents: number): SubPlan => {
  const credits = creditsForCharge(priceCents, subPriceAt(SUB_TIER_DISCOUNT[id] ?? 0)); // tier discount → more credits/$, net of Stripe's cut
  return { id, name, credits, priceCents, label: `${credits} credits / month` };
};
/** Recurring subscription plans (3 monthly tiers; round prices, credits derived at each tier's subsidized rate). */
export const SUB_PLANS: SubPlan[] = [plan("starter", "Starter", 1000), plan("pro", "Pro", 3000), plan("max", "Max", 7500)];
export const subPlanById = (id: string): SubPlan | undefined => SUB_PLANS.find((p) => p.id === id);
/** The plan whose monthly price is exactly `priceCents` (each tier has a distinct price), or undefined — maps a live
 *  Stripe item price back to a plan. */
export const subPlanByPrice = (priceCents: number): SubPlan | undefined => SUB_PLANS.find((p) => p.priceCents === priceCents);

// ── Credit refund (buyback) pricing — MODULE-OWNED (@suluk/billing excludes refund; the buyback RATE is app policy) ───
//
// A FLAT, conservative per-credit price strictly BELOW the cheapest acquisition rate, so a refund always returns less
// than was paid and can't be arbitraged. The user ALSO eats the Stripe processing fee (deducted in refundNetCents). The
// cost gate should assert refund rate ≤ min acquisition.

/** The actual per-credit price (µ$) of an acquisition option, after credit-rounding. */
const perCreditMicroUsd = (priceCents: number, credits: number): number => Math.round((priceCents * 10_000) / credits);

/** The CHEAPEST per-credit price across EVERY acquisition path (one-time packs at retail + each plan at its tier
 *  discount). The refund buyback stays strictly below this, so buying credits then refunding them can never profit. */
export const minAcquisitionPriceMicroUsd = Math.min(
  ...CREDIT_PACKS.map((p) => perCreditMicroUsd(p.priceCents, p.credits)),
  ...SUB_PLANS.map((p) => perCreditMicroUsd(p.priceCents, p.credits)),
);

export const REFUND_HAIRCUT_PCT = 0.2; // 20% below the best acquisition rate
export const refundCreditPriceMicroUsd = Math.round(minAcquisitionPriceMicroUsd * (1 - REFUND_HAIRCUT_PCT));

/** Gross buyback value (cents) for `credits` at the refund rate, BEFORE the Stripe fee. */
export const refundGrossCents = (credits: number): number => Math.round((credits * refundCreditPriceMicroUsd) / 10_000);
/** Net cash refunded (cents): the gross buyback minus the Stripe cut the user eats on the payout, floored at 0. */
export const refundNetCents = (credits: number): number => {
  const gross = refundGrossCents(credits);
  return Math.max(0, gross - stripeCutCents(gross));
};
