import { test, expect, describe } from "bun:test";
import { buildScenarioOutlines, renderScenarioOutlines } from "../src/outline";
import { parseFeature } from "../src/gherkin";
import type { OpenAPIv4Document } from "@suluk/core";

/**
 * C040-P1 — generate a Scenario Outline per op: columns = client-facing input fields (computed dropped), seed row from
 * the C041 origin-aware resolver; a `sourced` column seeds as the wiring token `<op.select>`, not a value. Plus the
 * gherkin parser now CAPTURES the Examples table (it used to drop it), so render→parse round-trips.
 */
const doc = {
  openapi: "4.0.0-candidate",
  info: { title: "Billing" },
  paths: {
    "billing/charge": {
      requests: {
        charge: {
          method: "post",
          contentSchema: {
            type: "object",
            required: ["amountCents", "subscriptionId"],
            properties: {
              amountCents: { type: "integer", minimum: 100 },
              subscriptionId: { type: "string", "x-suluk-origin": "sourced", "x-suluk-from": { op: "createSubscription", select: "id" } },
              total: { type: "number", "x-suluk-origin": "computed" },
            },
          },
          responses: { ok: { status: 200 } },
        },
      },
    },
    health: { requests: { health: { method: "get", responses: { ok: { status: 200 } } } } },
  },
} as unknown as OpenAPIv4Document;

describe("buildScenarioOutlines", () => {
  const outlines = Object.fromEntries(buildScenarioOutlines(doc).map((o) => [o.op, o]));

  test("columns are the client-facing inputs; a computed field is dropped", () => {
    expect(outlines.charge.columns.map((c) => c.name)).toEqual(["amountCents", "subscriptionId"]);
    expect(outlines.charge.columns.map((c) => c.origin)).toEqual(["input", "sourced"]);
  });

  test("an input cell seeds a synthesized value; a sourced cell seeds the <op.select> wiring token", () => {
    const byName = Object.fromEntries(outlines.charge.columns.map((c) => [c.name, c.seed]));
    expect(byName.amountCents).toBe("100"); // synthesized, honors minimum
    expect(byName.subscriptionId).toBe("<createSubscription.id>"); // wired, not a value
  });

  test("the When phrase references each column as a placeholder", () => {
    expect(outlines.charge.whenPhrase).toBe("I charge with amountCents=<amountCents> subscriptionId=<subscriptionId>");
  });

  test("a body-less op has no columns (renders as a plain Scenario, not an Outline)", () => {
    expect(outlines.health.columns).toEqual([]);
    expect(outlines.health.whenPhrase).toBe("I health");
  });
});

describe("renderScenarioOutlines → a .feature sidecar", () => {
  const feature = renderScenarioOutlines(doc);

  test("a column-bearing op becomes a Scenario Outline with an Examples table + the wiring token", () => {
    expect(feature).toContain("Scenario Outline: charge");
    expect(feature).toContain("Examples:");
    expect(feature).toContain("amountCents");
    expect(feature).toContain("<createSubscription.id>");
  });

  test("a body-less op becomes a plain Scenario (no Outline, no Examples)", () => {
    expect(feature).toContain("Scenario: health");
    expect(feature).not.toContain("Scenario Outline: health");
  });
});

describe("parseFeature captures the Examples table (round-trip)", () => {
  test("render → parse recovers the headers + the seed row", () => {
    const feature = renderScenarioOutlines(doc, { only: ["charge"] });
    const parsed = parseFeature(feature);
    const charge = parsed.scenarios.find((s) => s.name === "charge")!;
    expect(charge.examples?.headers).toEqual(["amountCents", "subscriptionId"]);
    expect(charge.examples?.rows).toEqual([["100", "<createSubscription.id>"]]);
  });

  test("a plain Scenario has no examples block", () => {
    const parsed = parseFeature("Feature: f\n\n  Scenario: s\n    When I do\n    Then it works\n");
    expect(parsed.scenarios[0].examples).toBeUndefined();
  });

  test("a hand-authored Outline with multiple rows parses every row", () => {
    const src = [
      "Feature: f",
      "  Scenario Outline: charge",
      "    When I charge with amountCents=<amountCents>",
      "    Then it succeeds",
      "    Examples:",
      "      | amountCents |",
      "      | 100         |",
      "      | 250         |",
    ].join("\n");
    const charge = parseFeature(src).scenarios[0];
    expect(charge.examples?.headers).toEqual(["amountCents"]);
    expect(charge.examples?.rows).toEqual([["100"], ["250"]]);
  });
});
