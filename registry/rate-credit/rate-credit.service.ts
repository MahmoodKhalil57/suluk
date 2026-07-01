/**
 * Rate-credit middleware (Suluk registry: `rate-credit`) — a CREDIT-BACKED FREE-TIER limiter. Where `rate-limit` meters a
 * declared fixed-window budget, THIS is the µ$ auto-regenerating allowance that sits alongside it: a token bucket
 * denominated in µ$ (the SAME unit as a route's COGS in `cost`). Every free-tier request debits a small fixed cost from a
 * per-principal bucket; when the bucket is empty the request is refused with 429 (RFC-9457). The regen rate is the
 * sustained free throughput and the cap is the burst, so the MOST free COGS a caller can ever cost the platform is
 * hard-bounded — no accidental bankruptcy.
 *
 * C052 boundary: this µ$ bucket math is APP-OWNED POLICY (the operator's dials + the free-tier gate shape), so it is
 * PORTED here rather than shipped as a `@suluk/*` package. Only the shared logic (the 429 RFC-9457 envelope via
 * `@suluk/core`'s `toProblemDetails`) comes from npm.
 *
 * State: one KV binding, `env.RATE_CREDIT_KV: KVNamespace` (a Cloudflare KV namespace, provisioned by `@suluk/provision`
 * separately — it is a BINDING, not an owned D1 table, so this module ships NO schema/provision fragment). The bucket
 * regenerates LAZILY on read (no cron), anchored on an epoch-ms timestamp. KV is eventually-consistent, so two concurrent
 * requests can both debit the same snapshot → a little over-spend slop; that's fine for an abuse cap (it is NOT the money
 * ledger). FAIL-OPEN on a KV error or an unbound namespace (a storage blip must never 429 a legit user; the regen rate
 * still bounds normal abuse). If `RATE_CREDIT_KV` is unbound (local dev), the middleware no-ops (logs once).
 *
 * Mount it globally on `/api/*` AFTER identity resolves (so the principal is on the context). `mountRateCredit(app)`.
 */
import { toProblemDetails } from "@suluk/core";
import type { Context, Hono, MiddlewareHandler } from "hono";
import type { Bindings } from "../app";

/**
 * A minimal local shape of a Cloudflare KV namespace — just the two members this module touches. Avoids a hard dependency
 * on `@cloudflare/workers-types` at the module boundary; if your app already pulls that in, this structurally matches
 * `KVNamespace`.
 */
export interface RateCreditKv {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

// ── Owned dials (operator-set) ──────────────────────────────────────────────────────────────────────────────────────
export const RATE_CREDIT_CAP_MICROUSD = 50_000; // $0.05 burst ceiling
export const RATE_CREDIT_REGEN_PER_HOUR_MICROUSD = 10_000; // $0.01/hour sustained refill
/** The fixed µ$ cost a single free-tier request debits (a whole free bucket ≈ 50 requests of burst, ~10/hour sustained). */
export const RATE_CREDIT_REQUEST_COST_MICROUSD = 1_000; // $0.001 / request

/** A token bucket's two dials: its burst ceiling + its sustained refill rate. The account-wide allowance uses the module
 *  constants; a per-API-key SUB-bucket ({@link keyRateDials}) uses a proportional slice of them — same µ$ cost unit. */
export interface BucketDials {
  capMicroUsd: number;
  regenPerHourMicroUsd: number;
}
const ACCOUNT_DIALS: BucketDials = { capMicroUsd: RATE_CREDIT_CAP_MICROUSD, regenPerHourMicroUsd: RATE_CREDIT_REGEN_PER_HOUR_MICROUSD };

/** A per-API-key sub-bucket's dials = its SHARE (%) of the account allowance, with burst AND sustained scaled together —
 *  so a capped key gets a proportional slice of the SAME shared µ$ cost allowance (not a separate budget). `sharePct` is
 *  clamped to [1,100]; 100 = the full allowance (no extra throttle beyond the shared account bucket). Because both dials
 *  scale by the same factor, the refill-from-empty TIME is identical at every share — only the burst + throughput shrink. */
export const keyRateDials = (sharePct: number): BucketDials => {
  const f = Math.min(100, Math.max(1, sharePct)) / 100;
  return { capMicroUsd: Math.round(RATE_CREDIT_CAP_MICROUSD * f), regenPerHourMicroUsd: Math.round(RATE_CREDIT_REGEN_PER_HOUR_MICROUSD * f) };
};

interface Bucket {
  balance: number; // µ$ remaining
  ts: number; // ms epoch of the last update (the regen anchor)
}

export interface RateCreditResult {
  allowed: boolean;
  remaining: number; // µ$ left after this request (or at rejection)
  retryAfterMs: number; // when rejected: ms until the bucket regenerates enough to cover this request (0 when allowed)
}

/** The KV key for a principal (signed-in user) or an IP. */
export const rateCreditKey = (principal: { userId?: string; ip: string }): string =>
  principal.userId ? `rc:u:${principal.userId}` : `rc:ip:${principal.ip}`;

/**
 * Lazily regenerate the bucket, then try to debit `costMicroUsd`. Returns `allowed:false` (→ the caller 429s) when the
 * regenerated balance can't cover the cost. Persists the new balance either way (so the regen is anchored). A cost ≤ 0 is
 * always allowed and writes nothing. Fail-open on any KV problem or an unbound namespace.
 */
export async function debitRateCredit(
  kv: RateCreditKv | undefined,
  key: string,
  costMicroUsd: number,
  nowMs: number,
  dials: BucketDials = ACCOUNT_DIALS,
): Promise<RateCreditResult> {
  const cap = dials.capMicroUsd;
  const regenPerMs = dials.regenPerHourMicroUsd / 3_600_000;
  if (costMicroUsd <= 0) return { allowed: true, remaining: cap, retryAfterMs: 0 };
  if (!kv) return { allowed: true, remaining: cap, retryAfterMs: 0 }; // no namespace bound (local dev) → don't gate
  if (regenPerMs <= 0) return { allowed: true, remaining: cap, retryAfterMs: 0 }; // a non-regenerating bucket is a config bug — fail OPEN (never self-lock a user; avoids ÷0)
  // Once idle this long the bucket would be full anyway → let an idle key EXPIRE so an absent key reads as a full bucket
  // (one fewer write for inactive users). cap ÷ regen-rate = time to refill from empty (identical across per-key shares).
  const ttlSec = Math.ceil(cap / regenPerMs / 1000) + 60;
  try {
    const raw = await kv.get(key);
    const parsed: unknown = raw ? JSON.parse(raw) : undefined;
    let prev: Bucket = { balance: cap, ts: nowMs }; // absent / unparseable → a full bucket
    if (typeof parsed === "object" && parsed !== null && "balance" in parsed && "ts" in parsed) {
      const b = Number((parsed as Record<string, unknown>).balance);
      const t = Number((parsed as Record<string, unknown>).ts);
      // Clamp the persisted balance to [0, cap]: a garbage/corrupted value (our own future bug — KV isn't user-writable)
      // can then neither over-credit (regen's min already caps that) NOR self-lock a legit user with a negative balance.
      if (Number.isFinite(b) && Number.isFinite(t)) prev = { balance: Math.min(cap, Math.max(0, b)), ts: t };
    }
    const regenerated = Math.min(cap, prev.balance + Math.max(0, nowMs - prev.ts) * regenPerMs);
    if (regenerated < costMicroUsd) {
      await kv.put(key, JSON.stringify({ balance: regenerated, ts: nowMs }), { expirationTtl: ttlSec });
      return { allowed: false, remaining: regenerated, retryAfterMs: Math.ceil((costMicroUsd - regenerated) / regenPerMs) };
    }
    const balance = regenerated - costMicroUsd;
    await kv.put(key, JSON.stringify({ balance, ts: nowMs }), { expirationTtl: ttlSec });
    return { allowed: true, remaining: balance, retryAfterMs: 0 };
  } catch (e) {
    console.warn("[rate-credit] KV error — failing open:", e instanceof Error ? e.message : String(e));
    return { allowed: true, remaining: cap, retryAfterMs: 0 };
  }
}

// ── The middleware mount ─────────────────────────────────────────────────────────────────────────────────────────────

/** The bindings this module reads: one KV namespace for the buckets. Structurally merged into the app `Bindings`. */
export interface RateCreditBindings {
  /** The KV namespace holding the per-principal µ$ buckets. Provisioned by `@suluk/provision`. Unbound in dev → no-op. */
  RATE_CREDIT_KV?: RateCreditKv;
}

/** Wiring knobs. All optional and defaulted — the free-tier gate works out of the box once `RATE_CREDIT_KV` is bound. */
export interface RateCreditOptions {
  /** The fixed µ$ cost debited per free-tier request. Default: {@link RATE_CREDIT_REQUEST_COST_MICROUSD}. */
  costMicroUsd?: number;
  /** The account bucket dials. Default: the module constants ($0.05 burst / $0.01·h refill). */
  dials?: BucketDials;
  /** Paths (prefix match) that carry NO principal-charge — health checks, webhooks, etc. Default: `/api/health`. */
  skip?: string[];
  /** The clock (default: `Date.now`) — overridable so tests inject a deterministic `now`. */
  now?: () => number;
}

const DEFAULT_SKIP = ["/api/health", "/api/webhooks"];

/** Read the request's principal key: the authenticated user id (off `c.var.user`, set by the auth identity middleware),
 *  else the client IP from the `cf-connecting-ip` header (Cloudflare's trustworthy source IP). */
function principalKeyOf(c: Context): string {
  const user = c.get("user") as { id?: string } | undefined;
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  return rateCreditKey({ userId: user?.id, ip });
}

let warnedUnbound = false;

/**
 * The credit-backed free-tier limiter as a Hono middleware. Per request (except the skip list): resolve the principal
 * key, debit the fixed cost from its µ$ bucket, and 429 (RFC-9457) when the bucket can't cover it — otherwise pass. When
 * `RATE_CREDIT_KV` is unbound (dev), no-op pass and log once.
 */
export function rateCredit(opts: RateCreditOptions = {}): MiddlewareHandler {
  const cost = opts.costMicroUsd ?? RATE_CREDIT_REQUEST_COST_MICROUSD;
  const dials = opts.dials ?? ACCOUNT_DIALS;
  const skip = opts.skip ?? DEFAULT_SKIP;
  const now = opts.now ?? Date.now;

  return async (c, next) => {
    const path = c.req.path;
    if (skip.some((p) => path.startsWith(p))) return next();

    const kv = (c.env as RateCreditBindings | undefined)?.RATE_CREDIT_KV;
    if (!kv) {
      if (!warnedUnbound) {
        warnedUnbound = true;
        console.warn("[rate-credit] RATE_CREDIT_KV unbound — free-tier credit gate disabled (dev no-op).");
      }
      return next();
    }

    const key = principalKeyOf(c);
    const result = await debitRateCredit(kv, key, cost, now(), dials);
    if (!result.allowed) {
      const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
      const body = toProblemDetails({
        tag: "RateLimitedError",
        detail: `Free-tier credit exhausted. Retry in ~${retryAfterSec}s, or add credits.`,
        instance: path,
      });
      return c.json(body, 429, { "Retry-After": String(retryAfterSec) });
    }
    return next();
  };
}

/**
 * Apply the credit-backed free-tier limiter to the `/api/*` surface — the global-middleware mount the generated entry
 * calls as `mountRateCredit(app)` (a cross-cutting concern, not a routed resource). Register it AFTER identity resolves so
 * the principal is on the context, alongside the fixed-window `rate-limit`.
 */
export function mountRateCredit<T extends Hono<{ Bindings: Bindings }>>(app: T, opts: RateCreditOptions = {}): T {
  app.use("/api/*", rateCredit(opts));
  return app;
}
