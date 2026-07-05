/**
 * Dedupe / result-cache middleware (C110) — the idempotency-key counterpart of {@link ./ratelimit.ts}: for each
 * request it resolves the operation, reads its declared `x-suluk-dedupe` budget, derives a key from the DECLARED
 * source (a header or body field NAME — never a value, never a node-output binding), and consults a SWAPPABLE
 * store: a fresh key runs the real handler and RECORDS its result; a key already in flight is rejected 409; a key
 * that already COMPLETED replays the recorded response instead of re-running the handler.
 *
 * Mirrors `ratelimit.ts`'s three deliberate shapes exactly:
 *   • The durable state is a SWAPPABLE BINDING (the {@link DedupeStore} interface) — `MemoryDedupeStore` is a
 *     DEV default only; a production KV / Durable-Object store belongs in @suluk/deploy, same as RateLimitStore.
 *   • ONE clock owner: the middleware computes `now` and passes it into every store call, so the store stays a
 *     pure function of its inputs and tests inject a deterministic clock.
 *   • Default-UNMETERED, opt-in: an op without a declared `x-suluk-dedupe` facet is never deduped — same
 *     threat-model split as rate-limiting (a missing budget is unmetered, not a breach).
 *
 * WHY a real store and not just an Effect combinator (per C108's own recommendation): a dedupe/result-cache needs
 * an ATOMIC per-key reservation across concurrent requests — the exact distributed-systems correctness surface
 * (concurrent-duplicate races, TTL/eviction, cache-key scoping) `@suluk/hono`'s `RateLimitStore` already carries
 * at the HTTP layer, not a pure-Effect graph-facet concern.
 */
import { PROBLEM_CONTENT_TYPE, toProblemDetails, type SulukDedupe } from "@suluk/core";
import type { Context, MiddlewareHandler } from "hono";

export interface DedupeConsumeOptions {
  ttlMs: number;
  /** the current epoch-ms, supplied by the middleware (the single clock owner). */
  now: number;
}

/** A captured response, replayed verbatim for a repeated key — whatever the handler returned (success OR a
 *  domain error), so a retry of the SAME idempotency key gets the SAME outcome instead of re-running side effects. */
export interface CachedResponse {
  status: number;
  body: string;
  contentType: string | null;
}

export type DedupeOutcome =
  | { state: "fresh" }
  | { state: "in-flight" }
  | { state: "completed"; response: CachedResponse };

/**
 * The swap point for a durable dedupe/result-cache. `reserve` atomically claims `key` for `ttlMs` if unclaimed
 * ("fresh"), reports a concurrent in-progress claim ("in-flight"), or replays a completed result ("completed"). A
 * production impl (KV / Durable Object) MUST make `reserve` atomic-per-key — that atomicity IS the dedupe
 * guarantee; the in-memory default is per-instance and NOT durable, so it is dev-only (mirrors RateLimitStore).
 */
export interface DedupeStore {
  reserve(key: string, opts: DedupeConsumeOptions): Promise<DedupeOutcome> | DedupeOutcome;
  /** Record the completed result so subsequent reservations replay it instead of re-running the handler. */
  complete(key: string, response: CachedResponse, opts: DedupeConsumeOptions): Promise<void> | void;
  /** Release a reservation WITHOUT recording a result (the handler threw) so a retry isn't stuck "in-flight" forever. */
  release(key: string): Promise<void> | void;
}

/**
 * DEV-ONLY store — a single in-process Map. Per-instance (does NOT coordinate across workers/isolates) so it
 * must NOT back production; use a @suluk/deploy KV/DO binding there (mirrors MemoryRateLimitStore exactly). A
 * stale "in-flight" entry (a handler that crashed without `release`) naturally clears once `resetAt` passes —
 * the TTL doubles as a fail-safe against a permanently stuck key.
 */
export class MemoryDedupeStore implements DedupeStore {
  private readonly store = new Map<string, { state: "in-flight" | "completed"; response?: CachedResponse; resetAt: number }>();

  reserve(key: string, { ttlMs, now }: DedupeConsumeOptions): DedupeOutcome {
    const entry = this.store.get(key);
    if (!entry || now > entry.resetAt) {
      this.store.set(key, { state: "in-flight", resetAt: now + ttlMs });
      return { state: "fresh" };
    }
    if (entry.state === "completed" && entry.response) return { state: "completed", response: entry.response };
    return { state: "in-flight" };
  }

  complete(key: string, response: CachedResponse, { ttlMs, now }: DedupeConsumeOptions): void {
    this.store.set(key, { state: "completed", response, resetAt: now + ttlMs });
  }

  release(key: string): void {
    this.store.delete(key);
  }
}

export interface EnforceDedupeConfig {
  /** Resolve the contract operation for a request (undefined ⇒ a non-contract path, passed through). */
  operationOf: (c: Context) => string | undefined;
  /** The declared dedupe budget for an operation (e.g. read off the document's `x-suluk-dedupe`). */
  dedupeOf: (operation: string) => SulukDedupe | undefined;
  /** The durable store (default: a per-instance {@link MemoryDedupeStore} — DEV ONLY). */
  store?: DedupeStore;
  /** Derive the concrete key from the request per the facet's declared `keySource` (default: read the named
   *  header, or the named body field via `c.req.json()` — Hono caches the parsed body, so the real handler's
   *  own `.json()` call downstream re-reads the SAME cached parse, never the raw stream twice). */
  keyOf?: (c: Context, facet: SulukDedupe) => Promise<string | undefined> | string | undefined;
  /** The clock (default: `Date.now`) — the single source of `now`. */
  now?: () => number;
}

async function defaultKeyOf(c: Context, facet: SulukDedupe): Promise<string | undefined> {
  if ("header" in facet.keySource) {
    const v = c.req.header(facet.keySource.header);
    return v || undefined;
  }
  try {
    const body = (await c.req.json()) as Record<string, unknown>;
    const v = body?.[facet.keySource.bodyField];
    return typeof v === "string" || typeof v === "number" ? String(v) : undefined;
  } catch {
    return undefined; // no/invalid JSON body -> no key extractable, caller falls through unmetered
  }
}

/** A concurrent duplicate is a 409 — the existing `ConflictError` tag (route-handler parity), not a new one:
 *  another request already claimed this exact idempotency key and hasn't finished yet. */
function denyInFlight(c: Context): Response {
  return c.json(toProblemDetails({ tag: "ConflictError", detail: "A request with this idempotency key is already in flight." }), 409, {
    "content-type": PROBLEM_CONTENT_TYPE,
  });
}

/** Replay a recorded response verbatim. Built as a raw `Response` (not `c.body`/`c.json`) because `cached.status`
 *  is a runtime `number`, not one of Hono's per-overload status-code literal unions. */
function replay(cached: CachedResponse): Response {
  const headers = new Headers({ "x-suluk-dedupe-replay": "true" });
  if (cached.contentType) headers.set("content-type", cached.contentType);
  return new Response(cached.body, { status: cached.status, headers });
}

/**
 * The facet-driven dedupe gate. Apply once (typically after identity, alongside enforceRateLimit): every
 * operation that DECLARES an `x-suluk-dedupe` budget is deduped by its declared key source; the rest pass
 * untouched. Fresh key → runs the real handler, then records its (cloned) response. In-flight key → 409.
 * Completed key → replays the recorded response, unrun.
 */
export function enforceDedupe(cfg: EnforceDedupeConfig): MiddlewareHandler {
  const store = cfg.store ?? new MemoryDedupeStore();
  const clock = cfg.now ?? (() => Date.now());
  const keyOf = cfg.keyOf ?? defaultKeyOf;
  return async (c, next) => {
    const op = cfg.operationOf(c);
    if (!op) return next(); // not a contract operation
    const facet = cfg.dedupeOf(op);
    if (!facet) return next(); // undeduped (opt-in)
    const base = await keyOf(c, facet);
    if (!base) return next(); // no key extractable on this request -> can't dedupe, pass through
    const key = `${op}:${facet.scope ?? ""}:${base}`;
    const outcome = await store.reserve(key, { ttlMs: facet.ttlMs, now: clock() });
    if (outcome.state === "completed") return replay(outcome.response);
    if (outcome.state === "in-flight") return denyInFlight(c);
    try {
      await next();
      const res = c.res;
      // a 5xx is an UNEXPECTED failure (effectRoute renders even an undeclared defect as a plain Response, never
      // a thrown exception — so the catch block below never sees it) — never cache/replay it: caching a defect
      // would permanently deny every retry of a genuinely transient failure for the rest of the TTL window,
      // defeating the whole point of an idempotency key. Only a real (2xx/4xx) outcome is a safe-to-replay result.
      if (res && res.status < 500) {
        const body = await res.clone().text();
        await store.complete(
          key,
          { status: res.status, body, contentType: res.headers.get("content-type") },
          { ttlMs: facet.ttlMs, now: clock() },
        );
      } else {
        await store.release(key);
      }
    } catch (err) {
      await store.release(key);
      throw err;
    }
  };
}
