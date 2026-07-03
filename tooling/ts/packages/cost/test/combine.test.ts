import { test, expect, describe } from "bun:test";
import { combineCost, sumCost, emptyCost, weighCost, type CostModel, type WeightTable } from "../src/index";

/**
 * The CostModel MONOID — cost bubbles up from composed service-actions. infra ADDS, components CONCAT, settlement
 * STRONGEST-wins, and background-cost facets AGREE-or-throw. Associative + commutative with identity emptyCost.
 */

const read: CostModel = { components: [], infra: { "d1.read": 1 }, settlement: { method: "rate-limited" } };
const write: CostModel = { components: [], infra: { "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } };

describe("combineCost — the merge laws", () => {
  test("infra ADDS key-wise", () => {
    expect(combineCost(read, read).infra).toEqual({ "d1.read": 2 });
    expect(combineCost(read, write).infra).toEqual({ "d1.read": 2, "d1.write": 1 });
  });

  test("components CONCAT (two sub-ops each metering a third party both count)", () => {
    const ai = { components: [{ source: "openai", basis: "per-1k-tokens" as const, microUsd: 10 }] };
    const egress = { components: [{ source: "egress", basis: "per-mb" as const, microUsd: 2 }] };
    expect(combineCost(ai, egress).components).toEqual([
      { source: "openai", basis: "per-1k-tokens", microUsd: 10 },
      { source: "egress", basis: "per-mb", microUsd: 2 },
    ]);
  });

  test("estimateMicroUsd ADDS", () => {
    expect(combineCost({ components: [], estimateMicroUsd: 100 }, { components: [], estimateMicroUsd: 50 }).estimateMicroUsd).toBe(150);
    expect(combineCost({ components: [] }, { components: [] }).estimateMicroUsd).toBeUndefined();
  });

  test("settlement — the STRONGEST recovery method wins; credits SUM", () => {
    const free: CostModel = { components: [], settlement: { method: "free" } };
    const credit: CostModel = { components: [], settlement: { method: "credit", credits: 3 } };
    const credit2: CostModel = { components: [], settlement: { method: "credit", credits: 4 } };
    expect(combineCost(free, credit).settlement).toEqual({ method: "credit", credits: 3 });
    expect(combineCost(credit, credit2).settlement).toEqual({ method: "credit", credits: 7 });
    // rate-limited ≻ free, but ≺ credit
    expect(combineCost(read, free).settlement?.method).toBe("rate-limited");
    expect(combineCost(read, credit).settlement?.method).toBe("credit");
  });

  test("trigger AGREES on default-sync; two different non-sync triggers THROW", () => {
    expect(combineCost(read, write).trigger).toBeUndefined(); // both sync → omitted
    const sched: CostModel = { components: [], trigger: "scheduled" };
    const hook: CostModel = { components: [], trigger: "webhook-received" };
    expect(() => combineCost(sched, hook)).toThrow(/trigger/);
    expect(combineCost(sched, { components: [] }).trigger).toBe("scheduled"); // one declares, other absent → agree
  });
});

describe("monoid laws", () => {
  test("emptyCost is the identity (value-equal)", () => {
    expect(combineCost(emptyCost, write)).toEqual({ components: [], infra: { "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } });
  });

  test("associative + commutative — the same leaves sum to the same infra regardless of nesting/order", () => {
    const a: CostModel = { components: [], infra: { "d1.read": 1 } };
    const b: CostModel = { components: [], infra: { "d1.write": 2 } };
    const c: CostModel = { components: [], infra: { "d1.read": 3 } };
    const left = combineCost(combineCost(a, b), c).infra;
    const right = combineCost(a, combineCost(b, c)).infra;
    const shuffled = sumCost([c, a, b]).infra;
    expect(left).toEqual({ "d1.read": 4, "d1.write": 2 });
    expect(right).toEqual(left);
    expect(shuffled).toEqual(left);
  });

  test("sumCost([]) is emptyCost; sumCost skips undefined leaves", () => {
    expect(sumCost([])).toEqual(emptyCost);
    expect(sumCost([read, undefined, read]).infra).toEqual({ "d1.read": 2 });
  });
});

describe("weighs correctly after summing (no double-count — weigh runs ONCE on the merged model)", () => {
  test("a 3-read fan-out weighs to 3× the d1.read weight", () => {
    const weights: WeightTable = { "d1.read": 100, "worker.request": 5 };
    const merged = sumCost([read, read, read]); // { infra: { d1.read: 3 } }
    expect(weighCost(merged, weights).microUsd).toBe(300);
  });
});
