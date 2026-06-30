import { test, expect, describe } from "bun:test";
import { resolveExample, synthesize, type JsonSchema } from "../src/index";

/**
 * C040-P2 — the example precedence resolver + deterministic synthesizer (the witnessed slice).
 * Precedence: tester-PUBLIC > MAINTAINER (explicit, or the schema's own examples/example/const) > SYNTHETIC.
 * Synthetic is deterministic, always lowest, and always marked `synthetic: true` (never-launder).
 */

const stringSchema: JsonSchema = { type: "string" };

describe("resolveExample — precedence", () => {
  test("a tester-public example wins over everything", () => {
    const r = resolveExample({ type: "string", examples: ["from-schema"] }, { public: "P", maintainer: "M" }, "name");
    expect(r.value).toBe("P");
    expect(r.tier).toBe("public");
    expect(r.synthetic).toBe(false);
  });

  test("an explicit maintainer example wins over the schema example and synthetic", () => {
    const r = resolveExample({ type: "string", examples: ["from-schema"] }, { maintainer: "M" }, "name");
    expect(r.value).toBe("M");
    expect(r.tier).toBe("maintainer");
  });

  test("the schema's own examples[] is the maintainer tier when no explicit source is given", () => {
    const r = resolveExample({ type: "string", examples: ["from-schema"] }, {}, "name");
    expect(r.value).toBe("from-schema");
    expect(r.tier).toBe("maintainer");
    expect(r.provenance).toBe("schema.examples");
  });

  test("`example` (3.x singular) and `const` are also maintainer tier", () => {
    expect(resolveExample({ type: "string", example: "e" }).tier).toBe("maintainer");
    expect(resolveExample({ const: 42 }).value).toBe(42);
    expect(resolveExample({ const: 42 }).provenance).toBe("schema.const");
  });

  test("falls back to synthetic only when no human example exists — and marks it", () => {
    const r = resolveExample(stringSchema, {}, "title");
    expect(r.tier).toBe("synthetic");
    expect(r.synthetic).toBe(true);
    expect(r.provenance).toBe("synthetic");
    expect(typeof r.value).toBe("string");
  });

  test("synthetic flag is true ONLY when synthesized", () => {
    expect(resolveExample(stringSchema, { public: "x" }).synthetic).toBe(false);
    expect(resolveExample(stringSchema, { maintainer: "x" }).synthetic).toBe(false);
    expect(resolveExample({ type: "string", examples: ["x"] }).synthetic).toBe(false);
    expect(resolveExample(stringSchema).synthetic).toBe(true);
  });

  test("a falsy public value (0, '', false) still counts as supplied — undefined does not", () => {
    expect(resolveExample({ type: "integer" }, { public: 0 }).tier).toBe("public");
    expect(resolveExample({ type: "string" }, { public: "" }).tier).toBe("public");
    expect(resolveExample({ type: "boolean" }, { public: false }).tier).toBe("public");
    expect(resolveExample({ type: "string" }, { public: undefined }).tier).toBe("synthetic");
  });
});

describe("synthesize — deterministic, shape-honoring", () => {
  test("respects const / enum / default (in that order)", () => {
    expect(synthesize({ const: "C" })).toBe("C");
    expect(synthesize({ enum: ["a", "b"] })).toBe("a");
    expect(synthesize({ type: "string", default: "D" })).toBe("D");
  });

  test("string formats map to fixed representatives", () => {
    expect(synthesize({ type: "string", format: "email" })).toBe("user@example.com");
    expect(synthesize({ type: "string", format: "uuid" })).toBe("00000000-0000-4000-8000-000000000000");
    expect(synthesize({ type: "string", format: "date-time" })).toBe("2026-01-01T00:00:00Z");
    expect(synthesize({ type: "string", format: "uri" })).toBe("https://example.com");
  });

  test("string honors minLength / maxLength using the hint", () => {
    expect(synthesize({ type: "string", minLength: 8 }, "id")).toHaveLength(8);
    expect((synthesize({ type: "string", maxLength: 2 }, "name") as string).length).toBeLessThanOrEqual(2);
    expect(synthesize({ type: "string" }, "title")).toBe("title");
  });

  test("integer/number honor minimum (and exclusiveMinimum)", () => {
    expect(synthesize({ type: "integer", minimum: 100, maximum: 100_000 })).toBe(100);
    expect(synthesize({ type: "integer", maximum: 5 })).toBe(5);
    expect(synthesize({ type: "number", exclusiveMinimum: 0 })).toBeGreaterThan(0);
  });

  test("boolean and null", () => {
    expect(synthesize({ type: "boolean" })).toBe(true);
    expect(synthesize({ type: "null" })).toBeNull();
  });

  test("array honors minItems and recurses into items", () => {
    const v = synthesize({ type: "array", items: { type: "string" }, minItems: 2 }, "tags") as unknown[];
    expect(Array.isArray(v)).toBe(true);
    expect(v).toHaveLength(2);
    expect(typeof v[0]).toBe("string");
  });

  test("object synthesizes every declared property with the property name as hint", () => {
    const v = synthesize({
      type: "object",
      properties: { email: { type: "string", format: "email" }, count: { type: "integer", minimum: 3 } },
    }) as Record<string, unknown>;
    expect(v).toEqual({ email: "user@example.com", count: 3 });
  });

  test("is fully deterministic — same schema yields a deep-equal value", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: { a: { type: "string" }, b: { type: "array", items: { type: "integer", minimum: 1 } } },
    };
    expect(synthesize(schema)).toEqual(synthesize(schema));
  });
});

describe("synthesize — a realistic nested body (toolfactory ConvertSubtitleBody shape)", () => {
  const ConvertBody: JsonSchema = {
    type: "object",
    required: ["to", "files"],
    properties: {
      to: { type: "string", enum: ["srt", "vtt", "ass"] },
      from: { type: "string", enum: ["srt", "vtt"] },
      requestId: { type: "string", minLength: 8, maxLength: 128 },
      files: {
        type: "array",
        minItems: 1,
        maxItems: 20,
        items: {
          type: "object",
          required: ["name", "content"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 255 },
            content: { type: "string", minLength: 1, maxLength: 1_000_000 },
          },
        },
      },
    },
  };

  test("produces a structurally valid, constraint-honoring seed row", () => {
    const v = synthesize(ConvertBody) as any;
    expect(v.to).toBe("srt"); // first enum
    expect(typeof v.requestId).toBe("string");
    expect(v.requestId.length).toBeGreaterThanOrEqual(8);
    expect(Array.isArray(v.files)).toBe(true);
    expect(v.files.length).toBe(1); // minItems
    expect(typeof v.files[0].name).toBe("string");
    expect(typeof v.files[0].content).toBe("string");
  });
});
