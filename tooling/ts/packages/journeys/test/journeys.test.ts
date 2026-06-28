import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document } from "@suluk/core";
import { generateVocabulary, vocabularyHash, opHandle } from "../src/vocabulary";
import { parseFeature } from "../src/gherkin";
import { bindFeatures } from "../src/bind";
import { emitRunnableSuite } from "../src/emit";

/** A minimal v4 fixture echoing real toolfactory shapes (incl. the shared `api/billing/subscription` path). */
const DOC: OpenAPIv4Document = {
  openapi: "4.0.0-candidate",
  info: { title: "fixture", version: "0.0.0" },
  paths: {
    "api/credits": {
      requests: { getCredits: { method: "get", responses: { "200": { status: 200 } }, "x-suluk-access": { requires: "authenticated" }, "x-suluk-store": { key: "credits" } } },
    },
    "api/billing/checkout": {
      requests: { checkout: { method: "post", responses: { "200": { status: 200 }, "400": { status: 400 } }, "x-suluk-access": { requires: "authenticated" } } },
    },
    "api/billing/subscription": {
      requests: {
        getSubscription: { method: "get", responses: { "200": { status: 200 } }, "x-suluk-access": { requires: "authenticated" }, "x-suluk-store": { key: "subscription" } },
        cancelSubscription: { method: "post", responses: { "200": { status: 200 } }, "x-suluk-access": { requires: "authenticated" }, "x-suluk-store": { invalidates: ["subscription"] } },
      },
    },
    "api/transcribe": {
      requests: { transcribe: { method: "post", responses: { "200": { status: 200 } }, "x-suluk-access": { requires: "authenticated" }, "x-suluk-cost": { components: [{ basis: "per-unit" }] } } },
    },
  },
} as unknown as OpenAPIv4Document;

describe("generateVocabulary", () => {
  const vocab = generateVocabulary(DOC);
  const phrases = vocab.steps.map((s) => s.phrase);

  test("projects When phrases from method + operation name", () => {
    expect(phrases).toContain("When I checkout");
    expect(phrases).toContain("When I view credits"); // get + 'get' prefix → 'view'
    expect(phrases).toContain("When I transcribe");
  });

  test("projects a Given from x-suluk-access, a charge-Then from per-unit x-suluk-cost, and a store-Then", () => {
    expect(phrases).toContain("Given I am a signed-in user");
    expect(phrases).toContain("Then I am charged credits"); // transcribe is per-unit metered
    expect(phrases).toContain("Then my subscription refreshes"); // cancelSubscription invalidates subscription
    expect(phrases).toContain("Then I see my credits"); // getCredits query store
  });

  test("is deterministic — same doc → same hash", () => {
    expect(vocabularyHash(generateVocabulary(DOC))).toBe(vocabularyHash(vocab));
  });
});

describe("stable identity (name@path-uri)", () => {
  test("two operations sharing a path stay DISTINCT by name+path", () => {
    const vocab = generateVocabulary(DOC);
    const handles = vocab.operations.map((o) => o.handle);
    expect(handles).toContain(opHandle("getSubscription", "api/billing/subscription"));
    expect(handles).toContain(opHandle("cancelSubscription", "api/billing/subscription"));
    expect(new Set(handles).size).toBe(handles.length); // no collisions
  });
});

describe("bindFeatures — exact-or-UNBOUND, subject-relative outcomes, tri-state", () => {
  const vocab = generateVocabulary(DOC);

  test("binds exact steps; the generic 'Then it succeeds' binds to the scenario's When-subject (not an arbitrary op)", () => {
    const feature = parseFeature(`
Feature: f
  Scenario: top up
    Given I am a signed-in user
    When I checkout
    Then it succeeds
`);
    const report = bindFeatures(vocab, [feature]);
    const r = report.scenarios[0].results;
    expect(r[0].state).toBe("BOUND"); // Given
    expect(r[1].state).toBe("BOUND"); // When → checkout
    expect(r[1].handle).toBe(opHandle("checkout", "api/billing/checkout"));
    expect(r[2].state).toBe("BOUND"); // Then it succeeds → SUBJECT (checkout), the regression guard
    expect(r[2].handle).toBe(opHandle("checkout", "api/billing/checkout"));
  });

  test("an 'And' outcome inherits Then and binds to a mutation's invalidated store", () => {
    const feature = parseFeature(`
Feature: f
  Scenario: cancel
    Given I am a signed-in user
    When I cancel subscription
    Then my subscription refreshes
`);
    const r = bindFeatures(vocab, [feature]).scenarios[0].results;
    expect(r[2].state).toBe("BOUND");
    expect(r[2].handle).toBe(opHandle("cancelSubscription", "api/billing/subscription"));
  });

  test("an unbacked intent is NEEDS-CONTRACT; a paraphrase resolves via the alias map", () => {
    const feature = parseFeature(`
Feature: f
  Scenario: word doc
    Given I am a logged in user
    When I transcribe
    Then I download it as a Word document
`);
    const report = bindFeatures(vocab, [feature], { aliases: { "given i am a logged in user": "given i am a signed-in user" } });
    const r = report.scenarios[0].results;
    expect(r[0].state).toBe("BOUND"); // alias resolved the paraphrase → no dev
    expect(r[1].state).toBe("BOUND"); // transcribe
    expect(r[2].state).toBe("NEEDS-CONTRACT"); // no operation backs a Word-doc download
  });

  test("a paraphrased When does NOT silently bind (exact-or-UNBOUND)", () => {
    const feature = parseFeature(`
Feature: f
  Scenario: para
    When I start a checkout
`);
    const r = bindFeatures(vocab, [feature]).scenarios[0].results;
    expect(r[0].state).not.toBe("BOUND");
    expect(["PARAPHRASE", "NEEDS-DEV-GLUE"]).toContain(r[0].state);
  });

  test("coverage (contract → authored): uncovered operations are surfaced with stubs", () => {
    const feature = parseFeature(`
Feature: f
  Scenario: only checkout
    When I checkout
`);
    const report = bindFeatures(vocab, [feature]);
    expect(report.coverage.total).toBe(5);
    expect(report.coverage.covered).toBe(1);
    expect(report.coverage.holes.some((h) => h.name === "transcribe")).toBe(true);
    expect(report.coverage.holes.find((h) => h.name === "getCredits")!.stub).toContain("When I view credits");
  });
});

describe("emitRunnableSuite — lowers to the REAL @suluk/sdk entity-grouped accessor", () => {
  const vocab = generateVocabulary(DOC);
  const suite = emitRunnableSuite(
    DOC,
    vocab,
    [
      parseFeature(`
Feature: f
  Scenario: top up
    Given I am a signed-in user
    When I checkout
    Then it succeeds
  Scenario: balance
    Given I am a signed-in user
    When I view credits
    Then I see my credits
`),
    ],
  );

  test("imports the consumer's createClient and wires baseURL + token from env", () => {
    expect(suite).toContain('import { createClient } from "./sdk"');
    expect(suite).toContain("process.env.SULUK_BASE_URL");
    expect(suite).toContain("process.env.SULUK_USER_TOKEN");
  });

  test("calls the SDK's entity-grouped accessor (resolveOps/clientAccessor), NOT the flat op name", () => {
    expect(suite).toContain("client.billing.checkout("); // checkout (custom op) → billing.checkout
    expect(suite).toContain("client.credits.get("); // getCredits (CRUD) → credits.get
    expect(suite).not.toContain("client.checkout("); // never the flat by-name accessor
    expect(suite).not.toContain("client.getCredits(");
  });

  test("annotates the auth requirement for authenticated operations", () => {
    expect(suite).toContain("requires authenticated");
  });
});
