import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, buildAda, matchRequest } from "../src/index";

/**
 * D1 SAFETY GATE for C041 (`x-suluk-origin` + `x-suluk-from`) — the INDEPENDENT, MAINTAINED witness for the burhan claim
 * `origin_marker_d1_safe_matcher_invariant` (plan/facts/0field-origin.bn). The field-origin marker is a PER-PROPERTY
 * `.meta()` annotation on the inner JSON Schema, read ONLY by downstream codegen (the example synthesizer, stubgen, a
 * future @suluk/sdk sampler) — NEVER by any server path. The request→operation matcher treats a body as opaque (a body
 * folds to the `#inline` signature sentinel, never into the static key), so buildAda/matchRequest must be INVARIANT to
 * the marker — even when `x-suluk-from` is a STRUCTURED source edge declaring a response→request dependency. The moment
 * anyone makes the matcher read either keyword, the ADA stops being invariant and this fails. @suluk/core stays ignorant
 * of the convention: this stamps a RAW keyword, proving the matcher ignores arbitrary property keywords.
 */

const here = import.meta.dir;
const petstore = parseDocument(readFileSync(join(here, "conformance", "valid", "01-petstore.yaml"), "utf8"));

/** Recursively stamp the field-origin markers onto every typed/object schema node (incl. nested request-body props). */
function stampOrigins(node: unknown): void {
  if (Array.isArray(node)) {
    node.forEach(stampOrigins);
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (typeof obj.type === "string" || obj.properties) {
      obj["x-suluk-origin"] = "sourced";
      obj["x-suluk-from"] = { op: "createPet", select: "id" }; // a STRUCTURED, wireable edge — the strongest case
      obj.readOnly = true;
    }
    for (const v of Object.values(obj)) stampOrigins(v);
  }
}

function withOriginMarkers(doc: typeof petstore): typeof petstore {
  const clone = JSON.parse(JSON.stringify(doc)) as typeof petstore;
  stampOrigins(clone.paths);
  return clone;
}

const project = (ada: ReturnType<typeof buildAda>) => ({
  operations: ada.operations
    .map((o) => ({ pathTemplate: o.pathTemplate, name: o.name, method: o.request.method, signatureKey: o.signatureKey, tuple: o.tuple }))
    .sort((a, b) => (a.signatureKey + a.name).localeCompare(b.signatureKey + b.name)),
  collisions: ada.collisions.map((c) => ({ a: c.a.name, b: c.b.name, verdict: c.verdict })),
  signatureKeys: [...ada.bySignature.keys()].sort(),
});

const concrete = (tpl: string) => tpl.replace(/\{\?[^}]*\}/g, "").replace(/\{[^}]+\}/g, "x");

describe("D1 gate (C041): the request→operation matcher is INVARIANT to x-suluk-origin / x-suluk-from", () => {
  const withoutMarkers = petstore;
  const withMarkers = withOriginMarkers(petstore);

  test("the stamped doc PROVABLY contains the markers (so invariance is a real witness, not vacuous)", () => {
    const s = JSON.stringify(withMarkers);
    expect(s).toContain("x-suluk-origin");
    expect(s).toContain("x-suluk-from");
  });

  test("buildAda yields an identical ADA with vs without the field-origin markers", () => {
    expect(project(buildAda(withMarkers))).toEqual(project(buildAda(withoutMarkers)));
  });

  test("matchRequest resolves every operation identically with vs without the markers", () => {
    const adaW = buildAda(withMarkers);
    const adaWo = buildAda(withoutMarkers);
    for (const op of adaWo.operations) {
      const url = concrete(op.pathTemplate);
      const method = op.request.method;
      const norm = (r: ReturnType<typeof matchRequest>) =>
        r === null ? null : { name: r.operation.name, pathTemplate: r.operation.pathTemplate, pathParams: r.pathParams, query: r.query };
      expect(norm(matchRequest(adaW, method, url))).toEqual(norm(matchRequest(adaWo, method, url)));
    }
  });
});
