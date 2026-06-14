/**
 * SDK-free Stripe webhook signature verification (Web Crypto HMAC-SHA256) — runs on Workers / Bun / Node 18+ with
 * NO `stripe` SDK. The edge leaf: prove a webhook payload is authentic AND fresh before dispatching it (e.g. via
 * {@link webhookRouter}). `stripeProvider.verifyWebhook` (the SDK's constructEvent) stays for SDK callers; this is
 * the binding-free path, so a dev server and a Workers prod runtime can share ONE verifier instead of diverging.
 */

/** Constant-time hex-string compare (no early-out) — guards the signature check against timing oracles. */
export function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface VerifyOptions {
  /** current unix seconds (default `Date.now()/1000`) — injectable for tests + replay-window tuning. */
  now?: () => number;
  /** reject events whose timestamp is older than this many seconds (default 300 — Stripe's window). */
  toleranceSec?: number;
}

/**
 * Verify a Stripe `stripe-signature` header against the raw request body + the endpoint signing secret.
 * Returns true iff a v1 signature matches the HMAC of `${t}.${rawBody}` AND the timestamp is within tolerance.
 * Pass the RAW (unparsed) body — re-serializing JSON changes the bytes and breaks the HMAC.
 */
export async function verifyStripeSignature(rawBody: string, sigHeader: string, secret: string, opts: VerifyOptions = {}): Promise<boolean> {
  if (!rawBody || !sigHeader || !secret) return false;
  const parts: Record<string, string> = {};
  for (const p of sigHeader.split(",")) { const i = p.indexOf("="); if (i > 0 && !(p.slice(0, i) in parts)) parts[p.slice(0, i)] = p.slice(i + 1); } // split on the FIRST '=' only
  const ts = Number(parts.t);
  if (!parts.t || !parts.v1 || !Number.isFinite(ts)) return false;
  const now = (opts.now ?? (() => Date.now() / 1000))();
  if (Math.abs(now - ts) > (opts.toleranceSec ?? 300)) return false; // reject stale/replayed events (Stripe's 5-min window)
  const keyData = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", keyData, new TextEncoder().encode(`${ts}.${rawBody}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeHexEqual(expected, parts.v1);
}
