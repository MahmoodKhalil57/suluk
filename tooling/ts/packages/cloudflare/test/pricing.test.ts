import { test, expect, describe } from "bun:test";
import { infraWeights, weighInfra, INFRA_ALIASES, CLOUDFLARE_PRICING, MICRO_PER_USD } from "../src/pricing";

describe("infra cost weights — the base of the token economy", () => {
  test("the pricing loads with products + meters", () => {
    expect(CLOUDFLARE_PRICING.products.length).toBeGreaterThan(10);
    expect(CLOUDFLARE_PRICING.products.some((p) => p.id === "workers")).toBe(true);
  });

  test("weights are tokens (µ$) per unit — overage_usd / overage_per × 1e6", () => {
    const w = infraWeights();
    expect(w["workers.requests"]).toBeCloseTo(0.3); // $0.30 / 1M requests → 0.3 µ$/request
    expect(w["durable-objects.rows_read"]).toBeCloseTo(0.001); // $0.001 / 1M rows → 0.001 µ$/row
  });

  test("weighInfra sums units × weight, resolving friendly aliases", () => {
    const r = weighInfra({ "d1.read": 2, "d1.write": 1, "worker.request": 1 });
    expect(r.microUsd).toBeCloseTo(0.002 + 1 + 0.3); // 1.302 µ$
    expect(r.unknown).toEqual([]);
    expect(r.breakdown.find((b) => b.meter === "d1.rows_read")?.microUsd).toBeCloseTo(0.002); // d1.read → d1's own product meter
  });

  test("d1.storage_gb_month resolves to D1's own $0.75/GB-mo, not the cheaper DO-SQLite $0.20", () => {
    const r = weighInfra({ "d1.storage_gb_month": 5 });
    expect(r.unknown).toEqual([]);
    expect(r.microUsd).toBeCloseTo(3_750_000); // 5 GB-mo × $0.75 = $3.75, NOT 5 × $0.20
  });

  test("1 token = 1 µ$ ⇒ tokens map 1:1 to dollars at MICRO_PER_USD", () => {
    expect(MICRO_PER_USD).toBe(1_000_000);
    // 1.302 µ$ = 0.000001302 USD
    expect(weighInfra({ "d1.read": 2, "d1.write": 1, "worker.request": 1 }).microUsd / MICRO_PER_USD).toBeCloseTo(0.000001302, 9);
  });

  test("unknown meters are surfaced, never silently zeroed", () => {
    const r = weighInfra({ "worker.request": 1, "made.up.meter": 5 });
    expect(r.microUsd).toBeCloseTo(0.3);
    expect(r.unknown).toContain("made.up.meter");
  });

  test("every alias resolves to a real weighted meter", () => {
    const w = infraWeights();
    for (const canonical of Object.values(INFRA_ALIASES)) expect(w[canonical]).toBeGreaterThanOrEqual(0);
  });
});
