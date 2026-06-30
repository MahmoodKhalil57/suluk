import { test, expect, describe } from "bun:test";
import { settlementOf, settlementAudit, impliedErrorStatuses, settlementRollup, type CostSettlement } from "../src/index";
import type { OpenAPIv4Document, Request } from "@suluk/core";

/**
 * C044 — cost settlement (HOW a cost is recovered: credit | rate-limited | free). The fifth orthogonal cost axis.
 * settlementAudit is the generic form of toolfactory's "cost names a lever" governance check; impliedErrorStatuses is
 * the generic errors-gate. All pure functions of the declared facets — never a request value (rides the x-suluk-cost wall).
 */
const op = (cost: unknown, extra: Record<string, unknown> = {}): Request => ({ method: "post", "x-suluk-cost": cost, ...extra }) as unknown as Request;
const doc = (requests: Record<string, Request>): OpenAPIv4Document => ({ openapi: "4.0.0-candidate", info: { title: "T" }, paths: { "/x": { requests } } }) as unknown as OpenAPIv4Document;

describe("settlementOf", () => {
  test("reads the settlement off the cost facet", () => {
    expect(settlementOf(op({ estimateMicroUsd: 1000, settlement: { method: "credit", credits: 10 } }))).toEqual({ method: "credit", credits: 10 });
    expect(settlementOf(op({ estimateMicroUsd: 1000 }))).toBeUndefined();
  });
});

describe("settlementAudit — every priced op names a coherent lever", () => {
  test("a priced op with no settlement is flagged", () => {
    const f = settlementAudit(doc({ priced: op({ estimateMicroUsd: 200 }) }));
    expect(f.map((x) => x.rule)).toContain("cost-without-settlement");
  });

  test("rate-limited WITHOUT an x-suluk-ratelimit is a high finding (no cap to be the payment)", () => {
    const f = settlementAudit(doc({ bad: op({ estimateMicroUsd: 500, settlement: { method: "rate-limited" } }) }));
    const hit = f.find((x) => x.rule === "rate-limited-without-cap");
    expect(hit?.severity).toBe("high");
  });

  test("rate-limited WITH a cap is clean", () => {
    const f = settlementAudit(doc({ ok: op({ estimateMicroUsd: 0, components: [], settlement: { method: "rate-limited" } }, { "x-suluk-ratelimit": { windowMs: 1000, maxRequests: 10, key: "ip" } }) }));
    expect(f.some((x) => x.rule === "rate-limited-without-cap")).toBe(false);
  });

  test("credit with neither credits nor an estimate is flagged", () => {
    const f = settlementAudit(doc({ c: op({ components: [{ source: "x", basis: "per-call", microUsd: 5 }], settlement: { method: "credit" } }) }));
    expect(f.map((x) => x.rule)).toContain("credit-without-amount");
  });

  test("free-but-priced is a low finding (operator absorbs it)", () => {
    const f = settlementAudit(doc({ f: op({ estimateMicroUsd: 300, settlement: { method: "free" } }) }));
    const hit = f.find((x) => x.rule === "free-but-priced");
    expect(hit?.severity).toBe("low");
  });

  test("a well-formed credit op raises nothing", () => {
    const f = settlementAudit(doc({ good: op({ estimateMicroUsd: 1000, settlement: { method: "credit", credits: 10 } }) }));
    expect(f).toEqual([]);
  });
});

describe("impliedErrorStatuses — errors a request's facets imply", () => {
  test("credit→402, authenticated→401, owner-scope→403, rate-limit→429", () => {
    const r = op({ settlement: { method: "credit", credits: 5 } }, { "x-suluk-access": { requires: "authenticated", scope: "owner-only" }, "x-suluk-ratelimit": { windowMs: 1, maxRequests: 1, key: "ip" } });
    expect(impliedErrorStatuses(r)).toEqual([401, 402, 403, 429]);
  });

  test("an upstream per-request cost component implies 502", () => {
    expect(impliedErrorStatuses(op({ components: [{ source: "openai", basis: "per-request", microUsd: 100 }] }))).toEqual([502]);
  });

  test("a public, free op implies no error statuses", () => {
    expect(impliedErrorStatuses(op({ settlement: { method: "free" } }))).toEqual([]);
  });
});

describe("settlementRollup — how the API is monetized", () => {
  test("tallies ops by method + counts priced-but-unsettled", () => {
    const d = doc({
      a: op({ estimateMicroUsd: 100, settlement: { method: "credit", credits: 1 } }),
      b: op({ components: [], settlement: { method: "rate-limited" } }, { "x-suluk-ratelimit": { windowMs: 1, maxRequests: 1, key: "ip" } }),
      c: op({ estimateMicroUsd: 50 }), // priced, no settlement
    });
    expect(settlementRollup(d)).toEqual({ credit: 1, "rate-limited": 1, free: 0, unsettled: 1 });
  });
});

describe("D1 wall — settlement carries only STATIC facts, never a request-value selector", () => {
  // TYPE-LINKED: every CostSettlement field classifies as an enum or a scalar — none extracts a request VALUE (no
  // expression / pointer). Adding a value-extracting field fails to compile here until classified (the C037 discipline).
  const KIND: Record<keyof CostSettlement, "enum" | "scalar"> = { method: "enum", credits: "scalar", overflow: "enum" };
  test("no settlement field is a runtime value-expression/pointer", () => {
    for (const k of Object.keys(KIND)) expect(["enum", "scalar"]).toContain(KIND[k as keyof CostSettlement]);
    // a populated settlement holds an enum + an integer + an enum — nothing that points into a payload.
    const full: CostSettlement = { method: "rate-limited", credits: 10, overflow: "credit" };
    expect(typeof full.method).toBe("string");
    expect(Number.isInteger(full.credits)).toBe(true);
  });
});
