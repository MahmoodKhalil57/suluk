/**
 * The Stripe HTTP transport (C046 → C048) — the seam every billing wrapper rides. Now re-exported from @suluk/payments so
 * ALL of billing's Stripe HTTP (the agnostic payment flows AND the Stripe-platform ops: checkout, subscriptions, saved
 * cards, tax) rides ONE Stripe client. The legacy @suluk/stripe coupling is gone — there's no separate path to reach for
 * by accident. Config-injected: the secret key + a mockable `fetch`.
 */
export { type StripeConfig, stripePost, stripeGet, toForm } from "@suluk/payments";
