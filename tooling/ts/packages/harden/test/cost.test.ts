import { test, expect, describe } from "bun:test";
import { auditCost } from "../src/cost";
import type { OpenAPIv4Document } from "@suluk/core";

/**
 * The COST-COVERAGE dimension — harden incentivising the per-user cost metric. Every op should declare `x-suluk-cost`, and
 * a PRICED op should name a payment method (`settlement`). Grade = clean / examined ops. Pure function of the doc's facets.
 */
const doc = (requests: Record<string, Record<string, unknown>>): OpenAPIv4Document =>
  ({ openapi: "4.0.0-candidate", info: { title: "T" }, paths: { "/x": { requests } } }) as unknown as OpenAPIv4Document;

describe("auditCost — cost + payment-method coverage", () => {
  test("an op with NO x-suluk-cost is flagged cost-undeclared", () => {
    const a = auditCost(doc({ getThing: { method: "get" } }));
    expect(a.findings.map((f) => f.rule)).toContain("cost-undeclared");
    expect(a.findings[0]?.severity).toBe("medium");
    expect(a.clean).toBe(0);
    expect(a.grade).toBe("F");
  });

  test("a PRICED op with no payment method is flagged cost-without-payment (high)", () => {
    const a = auditCost(doc({ transcribe: { method: "post", "x-suluk-cost": { estimateMicroUsd: 5000 } } }));
    const hit = a.findings.find((f) => f.rule === "cost-without-payment");
    expect(hit?.severity).toBe("high");
    expect(a.clean).toBe(0);
  });

  test("infra-only cost counts as priced — still needs a payment method", () => {
    const a = auditCost(doc({ read: { method: "get", "x-suluk-cost": { infra: { "d1.read": 1 } } } }));
    expect(a.findings.map((f) => f.rule)).toContain("cost-without-payment");
  });

  test("a priced op WITH a settlement is clean", () => {
    const a = auditCost(doc({ buy: { method: "post", "x-suluk-cost": { estimateMicroUsd: 5000, settlement: { method: "credit", credits: 10 } } } }));
    expect(a.findings).toEqual([]);
    expect(a.clean).toBe(1);
    expect(a.grade).toBe("A");
  });

  test("an explicitly-free op (declared cost, method free, no positive price) is clean", () => {
    const a = auditCost(doc({ ping: { method: "get", "x-suluk-cost": { settlement: { method: "free" } } } }));
    expect(a.findings).toEqual([]);
    expect(a.clean).toBe(1);
  });

  test("the grade is the coverage fraction across ops", () => {
    const a = auditCost(
      doc({
        ok1: { method: "post", "x-suluk-cost": { estimateMicroUsd: 1, settlement: { method: "credit", credits: 1 } } },
        ok2: { method: "get", "x-suluk-cost": { settlement: { method: "free" } } },
        bad: { method: "get" }, // undeclared
      }),
    );
    expect(a.nodes).toBe(3);
    expect(a.clean).toBe(2);
    expect(a.score).toBe(67); // 2/3
    expect(a.grade).toBe("C");
  });

  test("ignore() excludes ops from the grade", () => {
    const a = auditCost(doc({ health: { method: "get" } }), { ignore: (_uri, name) => name === "health" });
    expect(a.nodes).toBe(0);
    expect(a.score).toBe(100); // nothing to grade → not penalised
    expect(a.grade).toBe("A");
  });
});
