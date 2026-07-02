import { test, expect, describe } from "bun:test";
import { rateLimitExposure, exposureAtUsers, DEFAULT_EXPOSURE_PERIOD_MS, type WeightTable } from "../src/index";
import type { OpenAPIv4Document, Request } from "@suluk/core";

/**
 * Rate-limit exposure — "money on the line". A route's per-call cost × its rate-limit cap (projected to the period) = the
 * most that route can cost ONE user; the sum is the per-user budget; × N users is the platform's max exposure. Pure function
 * of the declared cost + rate-limit facets × the weight table.
 */
const W: WeightTable = { "worker.request": 0.3, "d1.read": 0.001, "d1.write": 1 };
const op = (cost: unknown, ratelimit?: unknown): Request => ({ method: "get", "x-suluk-cost": cost, ...(ratelimit ? { "x-suluk-ratelimit": ratelimit } : {}) }) as unknown as Request;
const doc = (requests: Record<string, Request>): OpenAPIv4Document => ({ openapi: "4.0.0-candidate", info: { title: "T" }, paths: { "/x": { requests } } }) as unknown as OpenAPIv4Document;

describe("rateLimitExposure", () => {
  test("a route's exposure = per-call cost × cap projected to the period", () => {
    // 1 worker.request = 0.3 µ$/call; 60 calls/min; over 30 days = 60 × (30d / 1min) = 60 × 43200 = 2,592,000 calls
    const e = rateLimitExposure(doc({ read: op({ components: [], infra: { "worker.request": 1 } }, { windowMs: 60_000, maxRequests: 60, key: "principal" }) }), W);
    expect(e.routes).toHaveLength(1);
    expect(e.routes[0].maxCallsPerPeriod).toBeCloseTo(2_592_000);
    expect(e.routes[0].maxMicroUsdPerPeriod).toBeCloseTo(0.3 * 2_592_000); // 777,600 µ$ = $0.7776 / user / month
    expect(e.perUserMicroUsd).toBeCloseTo(777_600);
  });

  test("the per-user budget sums every route; exposureAtUsers scales it linearly", () => {
    const e = rateLimitExposure(doc({
      a: op({ components: [], infra: { "worker.request": 1 } }, { windowMs: 60_000, maxRequests: 60 }),
      b: op({ components: [], infra: { "worker.request": 1, "d1.write": 1 } }, { windowMs: 60_000, maxRequests: 30 }),
    }), W);
    expect(e.perUserMicroUsd).toBeGreaterThan(0);
    // the money on the line for 10,000 users = per-user budget × 10,000
    expect(exposureAtUsers(e, 10_000)).toBeCloseTo(e.perUserMicroUsd * 10_000);
    expect(exposureAtUsers(e, 0)).toBe(0);
  });

  test("a priced route with NO rate-limit cap is UNBOUNDED exposure, surfaced separately", () => {
    const e = rateLimitExposure(doc({ uncapped: op({ components: [], infra: { "worker.request": 1 } }) }), W);
    expect(e.routes).toHaveLength(0);
    expect(e.unbounded.map((u) => u.operation)).toContain("uncapped");
    expect(e.unbounded[0].costPerCallMicroUsd).toBeCloseTo(0.3);
  });

  test("a zero-cost route contributes nothing (no exposure, not unbounded)", () => {
    const e = rateLimitExposure(doc({ freebie: op({ components: [], infra: {} }, { windowMs: 1000, maxRequests: 1 }) }), W);
    expect(e.routes).toHaveLength(0);
    expect(e.unbounded).toHaveLength(0);
    expect(e.perUserMicroUsd).toBe(0);
  });

  test("routes are ranked by exposure (biggest risk first)", () => {
    const e = rateLimitExposure(doc({
      cheap: op({ components: [], infra: { "worker.request": 1 } }, { windowMs: 60_000, maxRequests: 10 }),
      dear: op({ components: [], infra: { "worker.request": 1, "d1.write": 1 } }, { windowMs: 60_000, maxRequests: 100 }),
    }), W);
    expect(e.routes[0].operation).toBe("dear"); // higher cost × higher cap
    expect(e.periodMs).toBe(DEFAULT_EXPOSURE_PERIOD_MS);
  });
});
