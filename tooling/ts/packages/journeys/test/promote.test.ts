import { test, expect, describe } from "bun:test";
import { parseFeature } from "../src/gherkin";
import {
  extractPublicRows,
  buildExampleObject,
  promoteExampleIntoZod,
  promoteFeatureExamples,
} from "../src/promote";
import type { JsonSchema } from "@suluk/examples";

/**
 * C040-P4 — promote a tester's @public Examples row into the Zod source as .meta({ examples }). The source-write is
 * MARKED, IDEMPOTENT, and NEVER CLOBBERS a hand-authored example.
 */

describe("extractPublicRows — a @public Examples block's first row", () => {
  const feature = parseFeature(
    [
      "Feature: f",
      "  Scenario Outline: charge",
      "    When I charge",
      "    @public",
      "    Examples:",
      "      | amountCents | currency |",
      "      | 100         | usd      |",
      "      | 250         | eur      |",
      "  Scenario Outline: private",
      "    When I charge",
      "    Examples:",
      "      | amountCents |",
      "      | 999         |",
    ].join("\n"),
  );

  test("only the @public-tagged block is returned, first row only", () => {
    const rows = extractPublicRows([feature]);
    expect(rows).toHaveLength(1);
    expect(rows[0].scenario).toBe("charge");
    expect(rows[0].headers).toEqual(["amountCents", "currency"]);
    expect(rows[0].row).toEqual(["100", "usd"]);
  });
});

describe("buildExampleObject — typed coercion, wiring tokens skipped", () => {
  const body: JsonSchema = {
    type: "object",
    properties: { amountCents: { type: "integer" }, currency: { type: "string" }, live: { type: "boolean" } },
  };
  test("coerces cells by the field type", () => {
    expect(buildExampleObject(["amountCents", "currency", "live"], ["100", "usd", "true"], body)).toEqual({
      amountCents: 100,
      currency: "usd",
      live: true,
    });
  });
  test("a sourced wiring token <op.select> is not a concrete public value — skipped", () => {
    expect(buildExampleObject(["amountCents", "subId"], ["100", "<createSubscription.id>"], body)).toEqual({ amountCents: 100 });
  });
});

describe("promoteExampleIntoZod — marked, idempotent, never-clobber", () => {
  const base = `import { z } from "zod";\nexport const ChargeBody = z.object({ amountCents: z.number().int() });\n`;

  test("appends a marked .meta({ examples }) to a schema with no meta", () => {
    const r = promoteExampleIntoZod(base, "ChargeBody", { amountCents: 100 }, "charge");
    expect(r.changed).toBe(true);
    expect(r.source).toContain("@suluk-public: charge");
    expect(r.source).toContain('examples: [{"amountCents":100}]');
    expect(r.source).toContain("z.object({ amountCents: z.number().int() }).meta(");
  });

  test("is idempotent — re-promoting REPLACES the marked block (single .meta), no double-append", () => {
    const once = promoteExampleIntoZod(base, "ChargeBody", { amountCents: 100 }, "charge").source;
    const twice = promoteExampleIntoZod(once, "ChargeBody", { amountCents: 250 }, "charge").source;
    expect(twice.match(/@suluk-public/g)).toHaveLength(1);
    expect(twice).toContain('examples: [{"amountCents":250}]');
    expect(twice).not.toContain('examples: [{"amountCents":100}]');
  });

  test("REFUSES to clobber a hand-authored top-level .meta({ examples })", () => {
    const hand = `export const ChargeBody = z.object({ amountCents: z.number() }).meta({ examples: [{ amountCents: 1 }] });\n`;
    const r = promoteExampleIntoZod(hand, "ChargeBody", { amountCents: 100 }, "charge");
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/not clobbering/i);
    expect(r.source).toBe(hand);
  });

  test("appends safely after a non-example .meta (description) — preserved", () => {
    const desc = `export const ChargeBody = z.object({ amountCents: z.number() }).meta({ description: "a charge" });\n`;
    const r = promoteExampleIntoZod(desc, "ChargeBody", { amountCents: 100 }, "charge");
    expect(r.changed).toBe(true);
    expect(r.source).toContain('description: "a charge"');
    expect(r.source).toContain("@suluk-public: charge");
  });

  test("a PROPERTY-level .meta is not mistaken for the top-level example meta", () => {
    const prop = `export const ChargeBody = z.object({ amountCents: z.number().meta({ description: "cents" }) });\n`;
    const r = promoteExampleIntoZod(prop, "ChargeBody", { amountCents: 100 }, "charge");
    expect(r.changed).toBe(true);
    // the property meta is untouched; a NEW top-level meta is appended
    expect(r.source).toContain('z.number().meta({ description: "cents" })');
    expect(r.source).toContain(") }).meta(/* @suluk-public");
  });

  test("a missing schema var is reported, not edited", () => {
    const r = promoteExampleIntoZod(base, "NopeBody", { x: 1 }, "x");
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/not found/);
  });
});

describe("promoteFeatureExamples — orchestrated over a feature, target injected", () => {
  const source = `export const ChargeBody = z.object({ amountCents: z.number().int() });\n`;
  const feature = parseFeature(
    ["Feature: f", "  Scenario Outline: charge", "    When I charge", "    @public", "    Examples:", "      | amountCents |", "      | 100         |"].join("\n"),
  );

  test("applies the public row to the resolved schema var", () => {
    const r = promoteFeatureExamples(source, [feature], (sc) => (sc === "charge" ? { schemaVar: "ChargeBody", bodySchema: { type: "object", properties: { amountCents: { type: "integer" } } } } : null));
    expect(r.applied).toEqual([{ scenario: "charge", schemaVar: "ChargeBody", reason: expect.stringContaining("promoted") }]);
    expect(r.source).toContain('examples: [{"amountCents":100}]');
  });

  test("an unresolved scenario is skipped, not applied", () => {
    const r = promoteFeatureExamples(source, [feature], () => null);
    expect(r.applied).toHaveLength(0);
    expect(r.skipped[0].reason).toMatch(/no target/);
  });
});
