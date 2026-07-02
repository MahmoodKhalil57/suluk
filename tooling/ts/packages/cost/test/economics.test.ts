import { test, expect, describe } from "bun:test";
import { weighCost, userEconomics, simulateUser, mergeWeights, type WeightTable } from "../src/index";

// a tiny weight table (tokens µ$ per unit) — in real use this is @suluk/cloudflare weightTable() merged with provider weights.
const W: WeightTable = { "worker.request": 0.3, "d1.read": 0.001, "d1.write": 1, "resend.email": 400 };

describe("weighCost — resolve a declared model to STATIC tokens via the weight table", () => {
  test("sums fixed per-call components + the infra usage", () => {
    const w = weighCost({ components: [{ source: "compute", basis: "per-call", microUsd: 100 }], infra: { "d1.read": 2, "worker.request": 1 } }, W);
    expect(w.fixedMicroUsd).toBe(100);
    expect(w.infraMicroUsd).toBeCloseTo(0.002 + 0.3); // 2 reads + 1 request
    expect(w.microUsd).toBeCloseTo(100.302);
  });

  test("dynamic (metered) components are NOT counted in the static weigh", () => {
    const w = weighCost({ components: [{ source: "openai", basis: "per-1k-tokens", microUsd: 6000 }], infra: { "worker.request": 1 } }, W);
    expect(w.microUsd).toBeCloseTo(0.3); // only the infra floor; the per-1k-tokens cost is metered at runtime
  });

  test("unknown meters are surfaced, never silently zeroed", () => {
    const w = weighCost({ components: [], infra: { "worker.request": 1, "made.up": 5 } }, W);
    expect(w.microUsd).toBeCloseTo(0.3);
    expect(w.unknownMeters).toContain("made.up");
  });
});

describe("mergeWeights — the bubble-up join point (CF infra + provider weights → one table)", () => {
  test("merges tables; later tables win on a key clash (operator override last)", () => {
    const cf: WeightTable = { "worker.request": 0.3, "d1.read": 0.001 };
    const stripe: WeightTable = { "stripe.charge": 300000 };
    const override: WeightTable = { "worker.request": 0.5 }; // operator repriced
    const merged = mergeWeights(cf, stripe, override);
    expect(merged["d1.read"]).toBe(0.001);
    expect(merged["stripe.charge"]).toBe(300000);
    expect(merged["worker.request"]).toBe(0.5); // last wins
  });
  test("skips undefined tables", () => {
    expect(mergeWeights({ a: 1 }, undefined, { b: 2 })).toEqual({ a: 1, b: 2 });
  });
  test("a route priced from the merged table draws from every provider", () => {
    const w = mergeWeights({ "worker.request": 0.3 }, { "resend.email": 400 }, { "stripe.charge": 300000 });
    const cost = weighCost({ components: [], infra: { "worker.request": 1, "resend.email": 1, "stripe.charge": 1 } }, w);
    expect(cost.infraMicroUsd).toBeCloseTo(0.3 + 400 + 300000);
    expect(cost.unknownMeters).toEqual([]);
  });
});

describe("the cost calculator — per-user token economics", () => {
  test("simulateUser: a test user accrues tokens = the dollars they cost us", () => {
    const { economics } = simulateUser("u1", [
      { operation: "read", times: 100, cost: { components: [], infra: { "d1.read": 1, "worker.request": 1 } } },
      { operation: "sendEmail", times: 3, cost: { components: [{ source: "resend", basis: "per-call", microUsd: 400 }], infra: { "worker.request": 1 } } },
      { operation: "buyCredits", times: 1, paidMicroUsd: 5_000_000 },
    ], W);
    // cost = 100×(0.001+0.3) + 3×(400+0.3) rounded per event ≈ 30.1 + 1200.9 ≈ 1231
    expect(economics.costMicroUsd).toBeGreaterThan(1000);
    expect(economics.paidMicroUsd).toBe(5_000_000);
    expect(economics.netMicroUsd).toBe(economics.costMicroUsd - 5_000_000); // negative here → a margin
    expect(economics.byOperation.read).toBeGreaterThan(0);
    expect(economics.bySource.cloudflare).toBeGreaterThan(0); // the weighed infra shows as a source
  });

  test("rate-limit budget is a SEPARATE non-$ currency, tracked apart from net$", () => {
    const { economics } = simulateUser("u2", [
      { operation: "ping", times: 100, cost: { components: [], infra: { "worker.request": 1 } }, ratelimitUsed: 1 },
    ], W);
    expect(economics.ratelimitUsed).toBe(100);
    expect(economics.paidMicroUsd).toBe(0); // rate-limited routes are "paid" by budget, not $
    expect(economics.netMicroUsd).toBe(economics.costMicroUsd); // still a real (small) $ cost we absorb
  });

  test("userEconomics nets cost against dollars paid in", () => {
    const events = [{ at: 0, principal: "u", operation: "x", breakdown: [{ source: "s", microUsd: 1000 }], totalMicroUsd: 1000 }];
    const e = userEconomics(events, "u", { paidMicroUsd: 600 });
    expect(e.costMicroUsd).toBe(1000);
    expect(e.netMicroUsd).toBe(400); // cost 1000 − paid 600 = 400 loss
  });
});
