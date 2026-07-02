/**
 * GOOGLE / better-auth WEIGHTS — the cost of authenticating, contributed to the token weight table (the provider analogue
 * of @suluk/cloudflare's infra weights). Google Sign-In (OAuth) is FREE and better-auth is self-hosted, so the third-party
 * fee is $0. The REAL per-login cost is the D1 session read/write — declare THAT as infra (`d1.write` / `d1.read`), which
 * the bubbled-up Cloudflare weights price. `google.oauth` is carried at 0 for OBSERVABILITY (a login route can mark that it
 * calls Google, so the cost trace names the dependency) and as the extension point for a PAID Google API (Maps, Places, …)
 * should one ever be wired — set its weight here and every route that declares it reprices automatically.
 *
 * Merge `AUTH_WEIGHTS` into the app's weight table (see @suluk/cost `mergeWeights`). Pure data — no runtime dependency.
 */

/** Google OAuth / Sign-In fee: $0 (free). Kept as a declared meter for observability + as the paid-Google-API extension point. */
export const GOOGLE_OAUTH_MICRO_USD = 0;

/** The provider fee weights for auth (meter → µ$/unit) to merge into the token weight table — $0 today (the cost is infra). */
export const AUTH_WEIGHTS: Record<string, number> = { "google.oauth": GOOGLE_OAUTH_MICRO_USD };
