import { test, expect, describe } from "bun:test";
import { auditOperation, auditDocument, assertGrade, grade, hardenSchema, hardenDocument } from "../src/index";
import type { OpenAPIv4Document } from "@suluk/core";

const weakReq = { method: "post", contentSchema: { type: "object", properties: {
  name: { type: "string" },                                            // ✗ no maxLength, ✗ no pattern
  age: { type: "integer" },                                            // ✗ no maximum, ✗ no minimum
  tags: { type: "array", items: { type: "string", maxLength: 10, pattern: "^x$" } }, // ✗ no maxItems
  meta: { type: "object" },                                            // ✗ open, ✗ no properties
  anything: {},                                                        // ✗ any
} } };
const strongReq = { method: "post", contentSchema: { type: "object", additionalProperties: false, properties: {
  name: { type: "string", maxLength: 64, pattern: "^[\\w ]+$" },
  age: { type: "integer", minimum: 0, maximum: 130 },
  tags: { type: "array", maxItems: 10, items: { type: "string", maxLength: 16, pattern: "^[a-z]+$" } },
  status: { type: "string", enum: ["draft", "published"] },            // bounded by enum → clean
} } };
const doc = { openapi: "4.0.0-candidate", info: { title: "T" }, paths: { weak: { requests: { createWeak: weakReq } }, strong: { requests: { createStrong: strongReq } } } } as unknown as OpenAPIv4Document;

describe("@suluk/harden — schema hardening as a scored facet", () => {
  test("a weak operation collects the right findings + a low grade", () => {
    const a = auditOperation(doc, "weak", "createWeak", weakReq);
    const rules = new Set(a.findings.map((f) => f.rule));
    expect(rules).toContain("no-any");
    expect(rules).toContain("string-max-length");
    expect(rules).toContain("string-pattern");
    expect(rules).toContain("number-maximum");
    expect(rules).toContain("array-max-items");
    expect(rules).toContain("object-closed");
    expect(rules).toContain("object-typed");
    expect(["D", "F"]).toContain(a.grade);
    expect(a.findings.find((f) => f.rule === "string-max-length")!.fix).toContain("maxLength");
  });

  test("a fully-hardened operation scores A (enum/const + bounds count as clean)", () => {
    const a = auditOperation(doc, "strong", "createStrong", strongReq);
    expect(a.findings).toEqual([]);
    expect(a.score).toBe(100);
    expect(a.grade).toBe("A");
  });

  test("auditDocument rolls up per-op grades + a severity breakdown, weakest first", () => {
    const d = auditDocument(doc);
    expect(d.byOperation[0].operation).toBe("createWeak"); // weakest first
    expect(d.bySeverity.high).toBeGreaterThan(0);
    expect(d.grade).toBe(grade(d.score));
    expect(d.byOperation.find((o) => o.operation === "createStrong")!.grade).toBe("A");
  });

  test("assertGrade is the CI gate — throws below the minimum, passes a hardened doc", () => {
    expect(() => assertGrade(doc, "A")).toThrow(/grade .* below the required A/);
    const strongDoc = { openapi: "4.0.0-candidate", info: { title: "T" }, paths: { strong: { requests: { createStrong: strongReq } } } } as unknown as OpenAPIv4Document;
    expect(assertGrade(strongDoc, "A").grade).toBe("A");
  });

  test("$ref'd models dedupe across operations (audited once)", () => {
    const refDoc = { openapi: "4.0.0-candidate", info: { title: "T" },
      paths: { a: { requests: { createA: { method: "post", contentSchema: { $ref: "#/components/schemas/Thing" } } } }, b: { requests: { createB: { method: "post", contentSchema: { $ref: "#/components/schemas/Thing" } } } } },
      components: { schemas: { Thing: { type: "object", additionalProperties: false, properties: { x: { type: "string" } } } } },
    } as unknown as OpenAPIv4Document;
    const d = auditDocument(refDoc);
    // Thing.x (no maxLength/pattern) is ONE node deduped across both ops → one string-max-length finding, not two
    expect(d.findings.filter((f) => f.rule === "string-max-length").length).toBe(1);
  });
});

describe("hardenSchema / hardenDocument — the transform (inverse of the audit)", () => {
  test("adds baseline bounds: string→maxLength+pattern, number→min/max, array→maxItems, object→closed", () => {
    const h = hardenSchema({ type: "object", properties: {
      name: { type: "string" }, age: { type: "integer" }, tags: { type: "array", items: { type: "string" } },
      meta: { type: "object", properties: { k: { type: "string" } } },
    } }) as Record<string, any>;
    expect(h.additionalProperties).toBe(false);
    expect(h.properties.name.maxLength).toBe(1024);
    expect(h.properties.name.pattern).toContain("u0000");
    expect(h.properties.age.maximum).toBe(1_000_000_000_000);
    expect(h.properties.age.minimum).toBe(-1_000_000_000_000);
    expect(h.properties.tags.maxItems).toBe(1000);
    expect(h.properties.tags.items.maxLength).toBe(1024);
    expect(h.properties.meta.additionalProperties).toBe(false); // nested objects WITH properties get closed
  });

  test("never overrides an author-set bound, and leaves enum/const/format strings alone", () => {
    const h = hardenSchema({ type: "string", maxLength: 64 }) as Record<string, unknown>;
    expect(h.maxLength).toBe(64);
    expect(hardenSchema({ type: "string", enum: ["a", "b"] })).not.toHaveProperty("maxLength");
    expect(hardenSchema({ type: "string", format: "email" })).not.toHaveProperty("pattern");
  });

  test("respects overridable floors", () => {
    const h = hardenSchema({ type: "string" }, { maxLength: 80, textPattern: null }) as Record<string, unknown>;
    expect(h.maxLength).toBe(80);
    expect(h).not.toHaveProperty("pattern");
  });

  test("INVERSE PROPERTY: hardenDocument fills the BOUND gaps → a bounds-only-weak doc then passes assertGrade('A')", () => {
    // gaps are ONLY missing bounds (every field typed, objects have properties) — exactly what the floor can fill.
    const boundsOnly = { method: "post", contentSchema: { type: "object", properties: {
      name: { type: "string" }, age: { type: "integer" }, tags: { type: "array", items: { type: "string" } },
    } } };
    const doc2 = { openapi: "4.0.0-candidate", info: { title: "T" }, paths: { w: { requests: { createW: boundsOnly } } } } as unknown as OpenAPIv4Document;
    expect(() => assertGrade(doc2, "A")).toThrow(); // unbounded today
    hardenDocument(doc2); // in place
    expect(assertGrade(doc2, "A").grade).toBe("A"); // the audit's gaps are now filled
  });

  test("idempotent — hardening twice is a no-op", () => {
    const once = hardenSchema({ type: "object", properties: { a: { type: "string" } } });
    expect(hardenSchema(once)).toEqual(once);
  });
});
