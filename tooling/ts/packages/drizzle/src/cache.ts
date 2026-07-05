/**
 * OPT-IN query cache — a `drizzle-orm/cache/core` `Cache` implementation with NO new paid dependency: drizzle's own
 * built-in backend is Upstash Redis (an external paid service the app wouldn't otherwise need); this one is backed
 * by Cloudflare's free `caches.default` Fetch-API cache in prod (zero binding, zero provisioning, zero KV read/write
 * billing) and a plain in-memory `Map` in dev. `strategy()` is always `"explicit"` — never `"all"` — so caching is
 * OFF by default and a query opts in one at a time via `.$withCache()`; this mirrors drizzle's own already
 * cost-conscious default and keeps the "never default into something more expensive" invariant.
 *
 * `onMutate` is a deliberate no-op: actively invalidating on every write would cost an extra lookup+delete on EVERY
 * mutation (including ones whose table was never cached) just to keep a table→keys index current — a real, ongoing
 * cost for a feature that's supposed to be free until opted into. Instead this is a TTL-only cache: an entry expires
 * after `ttlSeconds` on its own. Only opt a query into caching if it can tolerate that staleness window; anything
 * needing strict read-after-write consistency should not be cached at all.
 */
import { Cache, type MutationOption } from "drizzle-orm/cache/core";

/** A minimal key-value store this cache reads/writes through — swappable per environment. */
export interface CacheBackend {
  get(key: string): Promise<string | undefined>;
  put(key: string, value: string, ttlSeconds: number): Promise<void>;
}

/** Dev backend: a plain in-memory `Map`, module-scoped so it survives across requests within one `bun dev` process
 *  (zero infra — nothing to provision, nothing billed). Not shared across processes/isolates; that's fine for a
 *  staleness-tolerant, opt-in read cache. */
export function memoryCacheBackend(): CacheBackend {
  const store = new Map<string, { value: string; expiresAt: number }>();
  return {
    async get(key) {
      const hit = store.get(key);
      if (!hit) return undefined;
      if (hit.expiresAt <= Date.now()) { store.delete(key); return undefined; }
      return hit.value;
    },
    async put(key, value, ttlSeconds) {
      store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    },
  };
}

/** The Fetch-API `Cache` surface Cloudflare's `caches.default` implements — accepted as a structural type (not the
 *  `@cloudflare/workers-types` global) so this package never depends on Workers ambient types. */
export interface FetchCacheLike {
  match(request: string): Promise<Response | undefined>;
  put(request: string, response: Response): Promise<void>;
}

/** Prod backend: Cloudflare's free per-datacenter `caches.default` — no binding, no provisioning, no KV billing.
 *  Pass the Worker's own `caches.default` (or any object matching `FetchCacheLike`, e.g. a test double). Keys are
 *  synthesized as URLs under an internal-only host so they never collide with a real fetch cache entry. */
export function cloudflareCacheBackend(cache: FetchCacheLike, keyPrefix = "https://suluk-cache.internal/"): CacheBackend {
  const url = (key: string) => keyPrefix + encodeURIComponent(key);
  return {
    async get(key) {
      const res = await cache.match(url(key));
      return res ? await res.text() : undefined;
    },
    async put(key, value, ttlSeconds) {
      await cache.put(url(key), new Response(value, { headers: { "cache-control": `max-age=${ttlSeconds}` } }));
    },
  };
}

/** The Suluk cache: `strategy()` fixed to `"explicit"`, `ttlSeconds` (default 60) is the ONLY freshness knob, and
 *  `onMutate` is a no-op by design (see module header). Wire it in with `drizzle(client, { cache: new SulukCache(...) })`,
 *  then opt a query in with `.$withCache()`. */
export class SulukCache extends Cache {
  constructor(private backend: CacheBackend, private ttlSeconds = 60) {
    super();
  }

  strategy(): "explicit" | "all" {
    return "explicit";
  }

  async get(key: string): Promise<unknown[] | undefined> {
    const raw = await this.backend.get(key);
    return raw === undefined ? undefined : (JSON.parse(raw) as unknown[]);
  }

  async put(hashedQuery: string, response: unknown, _tables: string[], _isTag?: boolean): Promise<void> {
    await this.backend.put(hashedQuery, JSON.stringify(response), this.ttlSeconds);
  }

  async onMutate(_params: MutationOption): Promise<void> {
    // TTL-only — see module header for why this is deliberately not an active invalidation.
  }
}
