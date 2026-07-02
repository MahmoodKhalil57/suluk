/**
 * RESEND EMAIL WEIGHTS — the cost of sending via Resend, contributed to the token weight table (the provider analogue of
 * @suluk/cloudflare's infra weights). Resend Pro is $20/mo for 50,000 emails ≈ $0.0004/email = 400 µ$/email at the margin.
 * A route that sends declares `infra: { "resend.email": 1 }` and this weight prices it; the 3,000/mo free tier is a
 * SETTLEMENT concern (the app absorbs it), layered on top — not baked into the marginal weight here.
 *
 * Merge `RESEND_WEIGHTS` into the app's weight table (see @suluk/cost `mergeWeights`). Pure data — no transport dependency.
 */

/** Resend's marginal per-email cost: ~$0.0004 → 400 µ$/email (Pro tier). */
export const RESEND_EMAIL_MICRO_USD = 400;

/** The STATIC Resend fee weights (meter → µ$/unit) to merge into the token weight table. */
export const RESEND_WEIGHTS: Record<string, number> = { "resend.email": RESEND_EMAIL_MICRO_USD };
