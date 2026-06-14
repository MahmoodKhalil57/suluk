/**
 * A KV-backed RateLimitStore — the production durable counter @suluk/hono's `enforceRateLimit` needs (its
 * MemoryRateLimitStore is DEV-only; it doesn't coordinate across Workers isolates). Fixed-window counter in a
 * Workers KV namespace, fail-OPEN to a fallback store on any KV blip so a KV outage never hard-blocks traffic.
 *
 * Structurally typed (no @suluk/hono dependency — the consume contract is tiny + stable), so the returned store
 * plugs straight into enforceRateLimit({ store }). The KV binding is resolved LAZILY (a getter) because on Workers
 * the binding isn't available at module-init — capture it on first request.
 */

export interface ConsumeOptions { maxRequests: number; windowMs: number; now: number }
export interface ConsumeResult { limited: boolean; remaining: number; retryAfterMs: number }
/** Matches @suluk/hono's RateLimitStore (structural — satisfies enforceRateLimit's `store` without a package dep). */
export interface RateLimitStore { consume(key: string, opts: ConsumeOptions): Promise<ConsumeResult> }
/** The slice of the Workers KV API this needs (get/put with TTL). */
export interface KvLike { get(key: string): Promise<string | null>; put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void> }

/** A per-instance in-memory fixed-window store — the fail-open fallback (DEV only / KV-blip; not cross-isolate). */
export function memoryRateLimitStore(): RateLimitStore {
  const m = new Map<string, { count: number; resetAt: number }>();
  return {
    async consume(key, o) {
      let e = m.get(key);
      if (!e || o.now > e.resetAt) e = { count: 1, resetAt: o.now + o.windowMs };
      else e.count++;
      m.set(key, e);
      const limited = e.count > o.maxRequests;
      return { limited, remaining: Math.max(0, o.maxRequests - e.count), retryAfterMs: limited ? o.windowMs : 0 };
    },
  };
}

/**
 * Build a KV-backed RateLimitStore. `kv` is the namespace, or a getter (lazy — capture the binding on first request).
 * Falls open to `opts.fallback` (default a per-instance memory store) when KV is absent or errors.
 */
export function kvRateLimitStore(kv: KvLike | undefined | (() => KvLike | undefined), opts: { fallback?: RateLimitStore } = {}): RateLimitStore {
  const getKv = typeof kv === "function" ? kv : () => kv;
  const fallback = opts.fallback ?? memoryRateLimitStore();
  return {
    async consume(key, o) {
      const k = getKv();
      if (!k) return fallback.consume(key, o);
      try {
        const raw = await k.get(key);
        let e = raw ? (JSON.parse(raw) as { count: number; resetAt: number }) : null;
        if (!e || o.now > e.resetAt) e = { count: 1, resetAt: o.now + o.windowMs };
        else e.count++;
        const limited = e.count > o.maxRequests;
        await k.put(key, JSON.stringify(e), { expirationTtl: Math.max(60, Math.ceil(o.windowMs / 1000) + 5) });
        return { limited, remaining: Math.max(0, o.maxRequests - e.count), retryAfterMs: limited ? o.windowMs : 0 };
      } catch { return fallback.consume(key, o); } // KV blip → fail open
    },
  };
}
