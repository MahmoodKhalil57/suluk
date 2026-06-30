import { test, expect, describe } from "bun:test";
import { generateVocabulary } from "../src/vocabulary";
import { parseFeature } from "../src/gherkin";
import { emitRunnableSuite } from "../src/emit";
import type { OpenAPIv4Document } from "@suluk/core";

/**
 * C040-P1 (runnable half) — a Scenario Outline runs PER Examples row through the generated SDK client; an `input` cell
 * is a coerced literal, a `sourced` cell <op.select> is RESOLVED from a prior step's captured response (chaining across
 * a multi-step journey). Each bound When's result is captured under its op.name so a later sourced field reads it.
 */
const doc = {
  openapi: "4.0.0-candidate",
  info: { title: "Billing" },
  paths: {
    "/subs": {
      requests: {
        createSubscription: {
          method: "post",
          contentSchema: { type: "object", required: ["plan"], properties: { plan: { type: "string" } } },
          responses: { ok: { status: 200 } },
        },
      },
    },
    "/charge": {
      requests: {
        charge: {
          method: "post",
          contentSchema: {
            type: "object",
            required: ["amountCents", "subscriptionId"],
            properties: {
              amountCents: { type: "integer", minimum: 100 },
              subscriptionId: { type: "string", "x-suluk-origin": "sourced", "x-suluk-from": { op: "createSubscription", select: "id" } },
            },
          },
          responses: { ok: { status: 200 } },
        },
      },
    },
  },
} as unknown as OpenAPIv4Document;

const feature = parseFeature(
  [
    "Feature: billing journeys",
    "  Scenario Outline: subscribe then charge",
    "    When I create subscription",
    "    And I charge",
    "    Examples:",
    "      | plan | amountCents | subscriptionId          |",
    "      | pro  | 100         | <createSubscription.id> |",
    "      | team | 250         | <createSubscription.id> |",
  ].join("\n"),
);

describe("emitRunnableSuite — outline rows + sourced chaining", () => {
  const suite = emitRunnableSuite(doc, generateVocabulary(doc), [feature]);

  test("unrolls one test per Examples row", () => {
    expect(suite).toContain('test("subscribe then charge — example 1"');
    expect(suite).toContain('test("subscribe then charge — example 2"');
  });

  test("inlines the pick() helper + a per-row captured bag", () => {
    expect(suite).toContain("const pick =");
    expect(suite).toContain("const captured: Record<string, any> = {}");
  });

  test("builds each When op's body from the row, mapping columns to that op's fields by name", () => {
    expect(suite).toContain('{ plan: "pro" }'); // createSubscription gets only its own field
    expect(suite).toContain("amountCents: 100"); // input cell coerced to a number literal (its type)
  });

  test("a sourced cell resolves from the prior captured response (chaining), not a literal", () => {
    expect(suite).toContain('subscriptionId: pick(captured, "createSubscription", "id")');
  });

  test("captures each bound When's result under its op.name for downstream chaining", () => {
    expect(suite).toContain('captured["createSubscription"] = result1');
    expect(suite).toContain('captured["charge"] = result2');
  });

  test("row 2 uses its own input value", () => {
    expect(suite).toContain("amountCents: 250");
  });

  test("a plain (non-outline) scenario still emits a single test with a provide-input placeholder", () => {
    const plain = parseFeature("Feature: f\n\n  Scenario: just charge\n    When I charge\n    Then it succeeds\n");
    const out = emitRunnableSuite(doc, generateVocabulary(doc), [plain]);
    expect(out).toContain('test("just charge"');
    expect(out).toContain("/* provide input */");
    expect(out).not.toContain("const captured");
  });
});
