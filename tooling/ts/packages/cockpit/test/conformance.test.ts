import { test, expect, describe } from "bun:test";
import { conformanceGates, assertConformance, shipSummary } from "../src/index";
import type { OpenAPIv4Document } from "@suluk/core";

/**
 * C045 — the unified contract audit: conformanceGates composes harden(security+readiness) + cost + settlement(lever) +
 * implied-errors into the cockpit's Gate[] model. The generic form of toolfactory's conformance/governance/cost/errors
 * gates. Composition only — no new audit logic here.
 */
const docOf = (requests: Record<string, unknown>): OpenAPIv4Document => ({ openapi: "4.0.0-candidate", info: { title: "T" }, paths: { "/x": { requests } } }) as unknown as OpenAPIv4Document;

describe("conformanceGates — the five composed dimensions", () => {
  const dirty = docOf({
    charge: {
      method: "post",
      contentSchema: { type: "object", additionalProperties: false, required: ["amountCents", "balance"], properties: { amountCents: { type: "integer" }, balance: { type: "integer", "x-suluk-origin": "computed" } } },
      "x-suluk-cost": { estimateMicroUsd: 1000, components: [] }, // priced, no settlement
      "x-suluk-access": { requires: "authenticated" }, // implies 401
      responses: { "200": { status: 200 } }, // 401 not declared
    },
  });
  const gates = Object.fromEntries(conformanceGates(dirty).map((g) => [g.id, g]));

  test("emits the five dimensions", () => {
    expect(Object.keys(gates).sort()).toEqual(["costed", "errors", "hardened", "readiness", "settled"]);
  });
  test("hardening + readiness carry a grade", () => {
    expect(gates.hardened.detail).toMatch(/grade [A-F]/);
    expect(gates.readiness.detail).toMatch(/grade [A-F]/);
  });
  test("a priced op with no settlement is flagged on the settlement gate", () => {
    expect(gates.settled.status).not.toBe("ok");
    expect(gates.settled.detail).toContain("cost-without-settlement");
  });
  test("an undeclared facet-implied error is flagged on the errors gate", () => {
    expect(gates.errors.status).toBe("todo"); // 401 implied by auth, not declared
  });
});

describe("a clean contract passes every conformance gate", () => {
  const clean = docOf({
    clean: {
      method: "post",
      contentSchema: { type: "object", additionalProperties: false, required: ["name"], properties: { name: { type: "string", maxLength: 64, pattern: "^[a-z]+$" } }, examples: [{ name: "abc" }] },
      "x-suluk-cost": { estimateMicroUsd: 100, components: [{ source: "compute", basis: "per-call", microUsd: 100 }], settlement: { method: "credit", credits: 1 } },
      "x-suluk-access": { requires: "authenticated" },
      responses: { "200": { status: 200 }, "401": { status: 401 }, "402": { status: 402 } },
    },
  });

  test("all gates ok; assertConformance returns without throwing", () => {
    const gates = conformanceGates(clean);
    expect(gates.every((g) => g.status === "ok")).toBe(true);
    expect(() => assertConformance(clean)).not.toThrow();
    expect(shipSummary(gates).ready).toBe(true);
  });
});

describe("assertConformance gates CI on error-status dimensions", () => {
  const broken = docOf({
    free: {
      method: "post",
      contentSchema: { type: "object", additionalProperties: false, required: ["n"], properties: { n: { type: "string", maxLength: 8, pattern: "^[a-z]+$" } }, examples: [{ n: "a" }] },
      // settled by rate-limiting but NO x-suluk-ratelimit → a HIGH settlement finding → the settled gate is `error`
      "x-suluk-cost": { estimateMicroUsd: 500, components: [], settlement: { method: "rate-limited" } },
      responses: { "200": { status: 200 } },
    },
  });

  test("throws when a conformance gate is an error blocker", () => {
    expect(() => assertConformance(broken)).toThrow(/not conformant/i);
  });
});
