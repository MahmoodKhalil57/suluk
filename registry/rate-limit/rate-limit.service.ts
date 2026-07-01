/**
 * Rate-limit middleware (Suluk registry: `rate-limit`) — a principal-aware wrapper over `@suluk/hono`'s
 * {@link enforceRateLimit}. The fixed-window bucket math, the swappable {@link RateLimitStore} interface, the
 * `MemoryRateLimitStore`, and the 429 + Retry-After envelope all live UPSTREAM in @suluk/hono, so a fix flows via
 * npm (C052 boundary — npm the logic). THIS layer is the owned wiring: a principal-aware KEYER (key by the
 * authenticated user id off the Hono context, else fall back to the package's client-IP default) and the store
 * choice. It is a STATELESS binding like `email` — no DB, no provision fragment; the durable counter is a swappable
 * binding, not an owned table.
 *
 * The store: `MemoryRateLimitStore` is the DEV default (per-instance Map — it does NOT coordinate across
 * workers/isolates, so it must NOT back production). In PROD, pass a KV- or Durable-Object-backed `RateLimitStore`
 * (its `consume(key, opts)` MUST be atomic-per-key) via `opts.store` — that store is provisioned by @suluk/deploy,
 * not by this module.
 *
 * Apply once, after identity resolves (so the principal is on the context) and alongside enforceAccess: every
 * operation that DECLARES an `x-suluk-ratelimit` budget is metered; the rest pass untouched.
 */
import {
  enforceRateLimit,
  MemoryRateLimitStore,
  type EnforceRateLimitConfig,
  type RateLimitStore,
} from "@suluk/hono";
import type { SulukRateLimit } from "@suluk/core";
import type { Context, Hono, MiddlewareHandler } from "hono";
import type { Bindings } from "../app";

/**
 * The wiring knobs for this module. `operationOf` + `rateLimitOf` are the two facet resolvers @suluk/hono needs
 * (resolve the contract operation for a request, then look up its declared budget) — pass the ones your emitted
 * contract gives you. Everything else is optional and defaulted here.
 */
export interface RateLimitOptions {
  /** Resolve the contract operation for a request (undefined ⇒ a non-contract path → passed through). */
  operationOf: EnforceRateLimitConfig["operationOf"];
  /** The declared rate budget for an operation (e.g. read off the document's `x-suluk-ratelimit`). */
  rateLimitOf: EnforceRateLimitConfig["rateLimitOf"];
  /** The durable counter. Default: `MemoryRateLimitStore` (DEV ONLY). PROD: a KV/DO-backed `RateLimitStore`. */
  store?: RateLimitStore;
  /** A blanket budget for operations that declare none (escape hatch; default: unmetered/opt-in). */
  defaultFacet?: SulukRateLimit;
  /** The clock (default: `Date.now`) — overridable so tests inject a deterministic `now`. */
  now?: () => number;
}

/**
 * The owned, principal-aware keyer. When the facet keys by `"principal"` (or `"api-key"`), key on the
 * authenticated user id we read off the Hono context (`c.get("user")` — the Better Auth / `auth` module
 * convention), so a signed-in caller gets their own bucket regardless of source IP. If there is no principal on
 * the context (anonymous request, or an `"ip"`/`"global"` facet), fall back to the package's client-IP default by
 * returning `undefined`-equivalent — here we resolve IP ourselves to keep the keyer total.
 */
function principalKeyOf(c: Context, facet: SulukRateLimit): string {
  if (facet.key === "principal" || facet.key === "api-key") {
    const user = c.get("user") as { id?: string } | undefined;
    if (user?.id) return `principal:${user.id}`;
  }
  if (facet.key === "global") return "global";
  // anonymous or ip-keyed → resolve the client IP the same way @suluk/hono's default does.
  const fwd = c.req.header("x-forwarded-for");
  const first = fwd ? fwd.split(",")[0]?.trim() : undefined;
  return first || c.req.header("x-real-ip") || "unknown";
}

/**
 * Build the principal-aware rate-limit middleware. Thin: it only supplies the owned keyer + the store choice and
 * hands everything to {@link enforceRateLimit}, which does the bucket math and emits 429 + Retry-After.
 */
export function rateLimit(opts: RateLimitOptions): MiddlewareHandler {
  return enforceRateLimit({
    operationOf: opts.operationOf,
    rateLimitOf: opts.rateLimitOf,
    store: opts.store ?? new MemoryRateLimitStore(),
    keyOf: principalKeyOf,
    defaultFacet: opts.defaultFacet,
    now: opts.now,
  });
}

/**
 * Apply principal-aware rate limiting to EVERY request — the global-middleware mount the generated entry calls as
 * `mountRateLimit(app)` (a cross-cutting concern, not a routed resource). DEFAULT is opt-in: the resolvers decline, so
 * every request passes UNTIL you wire `operationOf`/`rateLimitOf` from your emitted v4 contract (and swap a durable
 * `store` for prod). Register it after identity resolves so the principal is on the context.
 */
export function mountRateLimit<T extends Hono<{ Bindings: Bindings }>>(
  app: T,
  opts: RateLimitOptions = { operationOf: () => undefined, rateLimitOf: () => undefined },
): T {
  app.use("*", rateLimit(opts));
  return app;
}
