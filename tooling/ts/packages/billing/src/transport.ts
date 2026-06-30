/**
 * The Stripe HTTP transport (C046) — the seam every billing wrapper rides. Config-injected: the secret key + a mockable
 * `fetch` (the app passes its env in prod; a test passes a mock). Extracted verbatim from the source's STRIPE_POST/GET,
 * including the refund idempotency-key (a retry of the SAME logical refund replays Stripe's first result, never moving
 * money twice).
 */
import { toForm } from "@suluk/stripe";

export interface StripeConfig {
  secretKey: string;
  /** the HTTP transport — a mock in tests; defaults to the global `fetch` in prod. */
  fetch?: typeof fetch;
}

const BASE = "https://api.stripe.com/v1";

export const stripePost = (cfg: StripeConfig, path: string, form: URLSearchParams, idempotencyKey?: string): Promise<Response> =>
  (cfg.fetch ?? fetch)(`${BASE}/${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${cfg.secretKey}`,
      "content-type": "application/x-www-form-urlencoded",
      // refunds pass one so a retry of the SAME logical refund never moves money twice (Stripe replays the first result).
      ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
    },
    body: form.toString(),
  });

export const stripeGet = (cfg: StripeConfig, path: string): Promise<Response> =>
  (cfg.fetch ?? fetch)(`${BASE}/${path}`, { headers: { authorization: `Bearer ${cfg.secretKey}` } });

export { toForm };
