import { test, expect, describe } from "bun:test";
import { SulukCache, memoryCacheBackend, cloudflareCacheBackend, type FetchCacheLike } from "../src/index";

describe("memoryCacheBackend — dev, zero-infra in-memory Map", () => {
  test("miss returns undefined; a fresh put is readable back", async () => {
    const backend = memoryCacheBackend();
    expect(await backend.get("k1")).toBeUndefined();
    await backend.put("k1", "hello", 60);
    expect(await backend.get("k1")).toBe("hello");
  });

  test("an already-expired entry (ttl in the past) reads back as a miss", async () => {
    const backend = memoryCacheBackend();
    await backend.put("k1", "hello", -1);
    expect(await backend.get("k1")).toBeUndefined();
  });
});

// A tiny in-memory double for Cloudflare's `caches.default` (Fetch API Cache) — matches FetchCacheLike exactly.
function fakeFetchCache(): FetchCacheLike {
  const store = new Map<string, Response>();
  return {
    async match(request) { const r = store.get(request); return r ? r.clone() : undefined; },
    async put(request, response) { store.set(request, response.clone()); },
  };
}

describe("cloudflareCacheBackend — prod, Cloudflare's free caches.default (no binding, no KV billing)", () => {
  test("miss returns undefined; a put is readable back through a Response round trip", async () => {
    const backend = cloudflareCacheBackend(fakeFetchCache());
    expect(await backend.get("k1")).toBeUndefined();
    await backend.put("k1", "hello", 60);
    expect(await backend.get("k1")).toBe("hello");
  });

  test("keys are URL-encoded under an internal-only host — never collide with a real fetch cache entry", async () => {
    const cache = fakeFetchCache();
    const backend = cloudflareCacheBackend(cache);
    await backend.put("weird key/with?chars", "v", 60);
    expect(await backend.get("weird key/with?chars")).toBe("v");
  });
});

describe("SulukCache — drizzle Cache implementation, explicit-only, TTL-only invalidation", () => {
  test("strategy is always explicit — never opts every query in by default", () => {
    expect(new SulukCache(memoryCacheBackend()).strategy()).toBe("explicit");
  });

  test("get/put round-trip a query result (an array of rows) through JSON", async () => {
    const cache = new SulukCache(memoryCacheBackend());
    expect(await cache.get("q1")).toBeUndefined();
    await cache.put("q1", [{ id: "1", title: "Buy milk" }], ["todo"], false);
    expect(await cache.get("q1")).toEqual([{ id: "1", title: "Buy milk" }]);
  });

  test("onMutate is a deliberate no-op — a cached entry survives a mutation (TTL-only, never actively invalidated)", async () => {
    const cache = new SulukCache(memoryCacheBackend());
    await cache.put("q1", [{ id: "1" }], ["todo"], false);
    await cache.onMutate({ tables: "todo" });
    expect(await cache.get("q1")).toEqual([{ id: "1" }]);
  });

  test("a short ttlSeconds actually expires the entry", async () => {
    const cache = new SulukCache(memoryCacheBackend(), -1);
    await cache.put("q1", [{ id: "1" }], ["todo"], false);
    expect(await cache.get("q1")).toBeUndefined();
  });
});
