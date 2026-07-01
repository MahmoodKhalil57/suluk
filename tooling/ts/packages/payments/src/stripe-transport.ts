/**
 * The low-level Stripe HTTP transport (C048) — the fetch-based Stripe client the {@link stripeConnector} rides, exported
 * so an app's Stripe-PLATFORM operations (hosted Checkout, subscriptions, saved-card management, Tax — the things the
 * agnostic PaymentConnector deliberately doesn't model) ride the SAME client instead of a separate legacy one. This is
 * intentionally Stripe-specific: agnostic payment FLOWS go through the connector, these platform ops through this
 * transport — one Stripe roof, no accidental second path. Workers-native (fetch + x-www-form-urlencoded), zero deps.
 */
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
      // refunds/charges pass one so a retry of the SAME logical operation never moves money twice (Stripe replays it).
      ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
    },
    body: form.toString(),
  });

export const stripeGet = (cfg: StripeConfig, path: string): Promise<Response> =>
  (cfg.fetch ?? fetch)(`${BASE}/${path}`, { headers: { authorization: `Bearer ${cfg.secretKey}` } });

/** Stripe's bracket-nested `x-www-form-urlencoded` encoder: objects → `key[k]`, arrays → `key[i]`, scalars appended;
 *  undefined/null are skipped. Handles the nested arrays checkout/subscription payloads need (`line_items[0][price]`). */
export function toForm(obj: Record<string, unknown>): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) encode(k, v, out);
  return out;
}

function encode(key: string, v: unknown, out: URLSearchParams): void {
  if (v === undefined || v === null) return;
  if (Array.isArray(v)) v.forEach((item, i) => encode(`${key}[${i}]`, item, out));
  else if (typeof v === "object") for (const [k, val] of Object.entries(v as Record<string, unknown>)) encode(`${key}[${k}]`, val, out);
  else out.append(key, String(v));
}
