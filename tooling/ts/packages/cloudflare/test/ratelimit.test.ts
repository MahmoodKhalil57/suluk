/**
 * kvRateLimitStore — the production KV-backed RateLimitStore. Fixed-window counting, window reset, lazy KV getter,
 * and fail-open to the fallback on a missing binding / KV error.
 */
import { test, expect, describe } from "bun:test";
import { kvRateLimitStore, memoryRateLimitStore, type KvLike } from "../src/index";

function mockKv(): KvLike & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return { map, async get(k) { return map.get(k) ?? null; }, async put(k, v) { map.set(k, v); } };
}

describe("kvRateLimitStore", () => {
  test("counts within a fixed window and limits past maxRequests", async () => {
    const s = kvRateLimitStore(mockKv());
    const o = { maxRequests: 3, windowMs: 60000, now: 1000 };
    expect((await s.consume("ip", o)).limited).toBe(false); // 1
    expect((await s.consume("ip", o)).limited).toBe(false); // 2
    const third = await s.consume("ip", o); // 3
    expect(third.limited).toBe(false);
    expect(third.remaining).toBe(0);
    const fourth = await s.consume("ip", o); // 4 → over
    expect(fourth.limited).toBe(true);
    expect(fourth.retryAfterMs).toBe(60000);
  });

  test("resets after the window elapses (now > resetAt)", async () => {
    const s = kvRateLimitStore(mockKv());
    await s.consume("ip", { maxRequests: 1, windowMs: 1000, now: 1000 });
    expect((await s.consume("ip", { maxRequests: 1, windowMs: 1000, now: 1500 })).limited).toBe(true); // same window
    expect((await s.consume("ip", { maxRequests: 1, windowMs: 1000, now: 3000 })).limited).toBe(false); // new window
  });

  test("separate keys are independent", async () => {
    const s = kvRateLimitStore(mockKv());
    const o = { maxRequests: 1, windowMs: 60000, now: 1000 };
    expect((await s.consume("a", o)).limited).toBe(false);
    expect((await s.consume("b", o)).limited).toBe(false); // b's own bucket
    expect((await s.consume("a", o)).limited).toBe(true);
  });

  test("lazy getter: no binding yet → falls open to the fallback, then uses KV once present", async () => {
    let kv: KvLike | undefined;
    const fallback = memoryRateLimitStore();
    const s = kvRateLimitStore(() => kv, { fallback });
    const o = { maxRequests: 100, windowMs: 60000, now: 1000 };
    expect((await s.consume("ip", o)).limited).toBe(false); // via fallback (kv undefined)
    kv = mockKv(); // binding captured on a later request
    expect((await s.consume("ip", o)).remaining).toBe(99); // now via KV (fresh count)
  });

  test("KV error fails OPEN to the fallback (never hard-blocks)", async () => {
    const throwingKv: KvLike = { async get() { throw new Error("kv down"); }, async put() { throw new Error("kv down"); } };
    const s = kvRateLimitStore(throwingKv);
    expect((await s.consume("ip", { maxRequests: 1, windowMs: 60000, now: 1000 })).limited).toBe(false); // fell open
  });
});
