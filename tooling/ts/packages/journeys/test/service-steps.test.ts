import { test, expect, describe } from "bun:test";
import { generateVocabulary } from "../src/vocabulary";
import { renderScenarioOutlines, buildScenarioOutlines } from "../src/outline";
import { parseFeature } from "../src/gherkin";
import { bindFeatures } from "../src/bind";

/** C094 — a SERVICE pipeline authors BDD `step`s (x-suluk-scenario); journeys derives a RICH, bindable scenario: the authored
 *  Given preconditions + When action + Then outcomes, plus a NEGATIVE scenario per DOMAIN-error response (404/400/…, never the
 *  cross-cutting 401/403/429/500). */
const doc = {
  openapi: "4.0.0", info: { title: "Todos", version: "1" },
  paths: {
    "api/todos/{id}": {
      requests: {
        getTodo: {
          method: "get",
          responses: { "200": { status: 200 }, "401": { status: 401 }, "403": { status: 403 }, "404": { status: 404 }, "500": { status: 500 } },
          "x-suluk-scenario": [
            { role: "given", text: "I am a signed-in user" },
            { role: "given", text: "a todo the caller owns exists" },
            { role: "when", text: "they open a todo by id" },
            { role: "then", text: "the todo is returned" },
          ],
        },
      },
    },
  },
} as unknown as Parameters<typeof generateVocabulary>[0];

describe("service-authored BDD steps (C094)", () => {
  test("the vocabulary carries the authored phrases + the 404 negative, and OMITS 401/403/500", () => {
    const phrases = generateVocabulary(doc).steps.map((s) => s.phrase);
    expect(phrases).toContain("When they open a todo by id");
    expect(phrases).toContain("Given a todo the caller owns exists");
    expect(phrases).toContain("Then the todo is returned");
    expect(phrases).toContain("Then it is not found");          // ← the 404 domain negative
    expect(phrases).not.toContain("Then it is forbidden");      // ← 403 is cross-cutting, omitted
  });

  test("the outline derives the rich scenario: authored given/when/then + a 404 negative (no 403 stub)", () => {
    const o = buildScenarioOutlines(doc).find((x) => x.op === "getTodo")!;
    expect(o.whenPhrase).toBe("they open a todo by id");         // authored overrides the derived "view todo"
    expect(o.givens).toEqual(["I am a signed-in user", "a todo the caller owns exists"]);
    expect(o.thens).toEqual(["it succeeds", "the todo is returned"]);
    expect(o.negatives.map((n) => n.status)).toEqual(["404"]);  // 401/403/500 dropped, only the domain 404
  });

  test("the generated .feature BINDS fully against the contract (positive + negative)", () => {
    const feature = renderScenarioOutlines(doc);
    const report = bindFeatures(generateVocabulary(doc), [parseFeature(feature)]);
    const flat = report.scenarios.flatMap((s) => s.results);
    const unbound = flat.filter((r) => r.state !== "BOUND");
    expect(unbound.map((r) => `${r.step.kind}:${r.step.text}`)).toEqual([]); // every step binds
    expect(flat.length).toBeGreaterThan(0);
  });
});

describe("C094 — 2xx success binds for non-200 shapes (review fix)", () => {
  const mk = (responses: Record<string, unknown>) => ({
    openapi: "4.0.0", info: { title: "T", version: "1" },
    paths: { "api/things/{id}": { requests: { purgeThing: { method: "delete", responses,
      "x-suluk-scenario": [{ role: "when", text: "they purge a thing" }] } } } },
  } as unknown as Parameters<typeof generateVocabulary>[0]);

  test("a 204 op's fabricated 'Then it succeeds' BINDS (generator + palette agree on 2xx)", () => {
    const doc = mk({ "204": { status: 204 }, "404": { status: 404 } });
    const report = bindFeatures(generateVocabulary(doc), [parseFeature(renderScenarioOutlines(doc))]);
    const unbound = report.scenarios.flatMap((s) => s.results).filter((r) => r.state !== "BOUND");
    expect(unbound.map((r) => r.step.text)).toEqual([]); // incl. the positive "it succeeds" for a 204 DELETE
  });

  test("an op with NO 2xx fabricates no success Then (nothing unbindable)", () => {
    const doc = mk({ "404": { status: 404 }, "409": { status: 409 } });
    const o = buildScenarioOutlines(doc).find((x) => x.op === "purgeThing")!;
    expect(o.thens).toEqual([]); // no fabricated "it succeeds"
    expect(o.negatives.map((n) => n.status).sort()).toEqual(["404", "409"]);
  });
});
