/**
 * The Stripe webhook surface (C048) — moved here from @suluk/stripe so the whole payment story (flows + transport +
 * pricing + webhooks) lives under @suluk/payments. Two pieces: SDK-free signature VERIFICATION (Web Crypto HMAC-SHA256 —
 * Workers/Bun/Node 18+, no `stripe` SDK) and a typed event ROUTER (dispatch a verified event to a per-type handler
 * instead of one giant switch). Pure of any SDK + network. @suluk/stripe re-exports these as a deprecated shim.
 */

// ── signature verification ────────────────────────────────────────────────────────────────────────────────────────

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
 * Verify a Stripe `stripe-signature` header against the raw request body + the endpoint signing secret. Returns true iff
 * a v1 signature matches the HMAC of `${t}.${rawBody}` AND the timestamp is within tolerance. Pass the RAW (unparsed)
 * body — re-serializing JSON changes the bytes and breaks the HMAC.
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

// ── the typed event router ────────────────────────────────────────────────────────────────────────────────────────

/** A verified webhook event — only `type` is required (the router dispatches on it); `data` carries the payload. */
export interface StripeWebhookEvent {
  type: string;
  data?: unknown;
}

export type WebhookHandler = (event: StripeWebhookEvent) => void | Promise<void>;

export interface HandleResult {
  type: string;
  /** a registered handler ran (false ⇒ the unhandled fallback ran, or nothing matched). */
  handled: boolean;
}

export interface WebhookRouter {
  /** register (or replace) the handler for an event type; chainable. */
  on(type: string, handler: WebhookHandler): WebhookRouter;
  /** register a fallback for types with no specific handler; chainable. */
  onUnhandled(handler: WebhookHandler): WebhookRouter;
  /** dispatch one verified event to its handler. */
  handle(event: StripeWebhookEvent): Promise<HandleResult>;
}

/** Build a router, optionally seeded with a `{ type → handler }` map. */
export function webhookRouter(handlers: Record<string, WebhookHandler> = {}): WebhookRouter {
  const map = new Map<string, WebhookHandler>(Object.entries(handlers));
  let fallback: WebhookHandler | undefined;
  const router: WebhookRouter = {
    on(type, handler) { map.set(type, handler); return router; },
    onUnhandled(handler) { fallback = handler; return router; },
    async handle(event) {
      const handler = map.get(event.type);
      if (handler) { await handler(event); return { type: event.type, handled: true }; }
      if (fallback) await fallback(event);
      return { type: event.type, handled: false };
    },
  };
  return router;
}

/** The common Stripe checkout/billing event types (for discoverability + typo-safe registration). */
export const STRIPE_EVENTS = {
  checkoutCompleted: "checkout.session.completed",
  checkoutExpired: "checkout.session.expired",
  paymentSucceeded: "payment_intent.succeeded",
  paymentFailed: "payment_intent.payment_failed",
  chargeRefunded: "charge.refunded",
  disputeClosed: "charge.dispute.closed",
  setupSucceeded: "setup_intent.succeeded",
  subscriptionUpdated: "customer.subscription.updated",
  subscriptionDeleted: "customer.subscription.deleted",
  invoicePaid: "invoice.paid",
} as const;
