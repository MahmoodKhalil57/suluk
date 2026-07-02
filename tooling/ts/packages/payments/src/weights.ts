/**
 * STRIPE FEE WEIGHTS — the cost of USING Stripe, contributed to the token weight table (the provider analogue of
 * @suluk/cloudflare's infra weights). Standard pricing is 2.9% + $0.30 per successful charge, which splits cleanly along
 * the static/dynamic seam the whole cost model is built on:
 *   • the FIXED $0.30 is a STATIC per-charge weight (`stripe.charge` = 300_000 µ$) — it weighs like any infra meter, so a
 *     charging route declares `infra: { "stripe.charge": 1 }` and the fixed fee is priced straight from here;
 *   • the 2.9% is DYNAMIC (a function of the charged amount), so it is NOT a static weight — a route declares it as a
 *     metered `per-request` cost component and the runtime meters it against the ACTUAL amount. `stripePercentFee` is that.
 *
 * Merge `STRIPE_WEIGHTS` into the app's weight table (see @suluk/cost `mergeWeights`) alongside the bubbled-up Cloudflare
 * infra weights. Pure data + arithmetic — no dependency on the transport or the connector.
 */

/** 1 token = 1 micro-USD; $1 = 1,000,000 tokens. Same unit the whole cost system prices in. */
export const MICRO_PER_USD = 1_000_000;

/** Stripe's FIXED per-successful-charge fee: $0.30 → 300,000 µ$ (a static weight). */
export const STRIPE_CHARGE_FEE_MICRO_USD = 300_000;

/** Stripe's VARIABLE rate: 2.9% of the charged amount — dynamic, metered at charge time (never a static weight). */
export const STRIPE_PERCENT = 0.029;

/** The STATIC Stripe fee weights (meter → µ$/unit) to merge into the token weight table. */
export const STRIPE_WEIGHTS: Record<string, number> = { "stripe.charge": STRIPE_CHARGE_FEE_MICRO_USD };

/** The DYNAMIC Stripe % fee (µ$) for a charged amount (µ$) — declare as a `per-request` cost component, metered per charge. */
export function stripePercentFee(amountMicroUsd: number): number {
  return Math.max(0, Math.round((Number.isFinite(amountMicroUsd) ? amountMicroUsd : 0) * STRIPE_PERCENT));
}

/** The TOTAL Stripe fee (µ$) for a charge of `amountMicroUsd`: the fixed $0.30 + the 2.9% — the full provider cost of one charge. */
export function stripeFee(amountMicroUsd: number): number {
  return STRIPE_CHARGE_FEE_MICRO_USD + stripePercentFee(amountMicroUsd);
}
