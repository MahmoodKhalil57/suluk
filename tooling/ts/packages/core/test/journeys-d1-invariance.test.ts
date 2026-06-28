import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, buildAda, matchRequest } from "../src/index";

/**
 * D1 SAFETY GATE for C038 (`@suluk/journeys`) — the PRE-COMMIT, MAINTAINED witness for the burhan claim
 * `journeys_d1_downstream_consumer` (plan/facts/0journeys.bn). @suluk/journeys ships NO contract facet in v1: the BDD
 * step vocabulary is a pure DERIVATION of names the contract already holds, and authored `.feature` stories are a
 * SIDECAR (free human prose — request VALUES — kept out of the contract). So `@suluk/journeys` is a downstream CONSUMER
 * of the document, never an input to the DOM→ADA matcher.
 *
 * This test PRE-WALLS the wall: it injects a HYPOTHETICAL future `x-suluk-journeys` block (the shape a later facet
 * might take — flows that reference operations by stable HANDLE, store keys, roles, statuses) and asserts the
 * request→operation matcher is byte-identical with vs without it. buildAda iterates `doc.paths` only; matchRequest
 * reads only method + the compiled path-template. The day anyone makes the matcher consult `x-suluk-journeys`, the ADA
 * stops being invariant and this fails — so a future facet can never land unwalled. Mirrors store-d1-invariance.test.ts.
 */

const here = import.meta.dir;
const petstore = parseDocument(readFileSync(join(here, "conformance", "valid", "01-petstore.yaml"), "utf8"));

/** Inject a hypothetical doc-level `x-suluk-journeys` map: named flows referencing ops by HANDLE + the metadata a
 * bound scenario carries (handles, store keys, roles, statuses) — every field is a NAME/scalar, never a request VALUE. */
function withJourneysFacet(doc: typeof petstore): typeof petstore {
  const opNames: string[] = [];
  for (const pi of Object.values(doc.paths)) for (const [name] of Object.entries(pi.requests ?? {})) opNames.push(name);
  const journeys = {
    "buy-and-list": {
      title: "Buy then list",
      // references operations by stable by-name handle, plus the contract-derived HandleSet a scenario tags
      steps: opNames.map((n) => ({ operationRef: `#/paths/.../requests/${n}` })),
      handleSet: { operations: opNames, storeKeys: ["pets"], roles: ["authenticated"], statuses: ["200", "404"] },
    },
  };
  return { ...doc, ["x-suluk-journeys"]: journeys, paths: JSON.parse(JSON.stringify(doc.paths)) } as unknown as typeof petstore;
}

const project = (ada: ReturnType<typeof buildAda>) => ({
  operations: ada.operations
    .map((o) => ({ pathTemplate: o.pathTemplate, name: o.name, method: o.request.method, signatureKey: o.signatureKey, tuple: o.tuple }))
    .sort((a, b) => (a.signatureKey + a.name).localeCompare(b.signatureKey + b.name)),
  collisions: ada.collisions.map((c) => ({ a: c.a.name, b: c.b.name, verdict: c.verdict })),
  signatureKeys: [...ada.bySignature.keys()].sort(),
});

const concrete = (tpl: string) => tpl.replace(/\{\?[^}]*\}/g, "").replace(/\{[^}]+\}/g, "x");

describe("D1 gate (C038): the request→operation matcher is INVARIANT to a hypothetical x-suluk-journeys facet", () => {
  const without = petstore;
  const withFacet = withJourneysFacet(petstore);

  test("buildAda yields an identical ADA with vs without the journeys facet", () => {
    expect(project(buildAda(withFacet))).toEqual(project(buildAda(without)));
  });

  test("matchRequest resolves every operation identically with vs without the journeys facet", () => {
    const adaW = buildAda(withFacet);
    const adaWo = buildAda(without);
    for (const op of adaWo.operations) {
      const url = concrete(op.pathTemplate);
      const norm = (r: ReturnType<typeof matchRequest>) =>
        r === null ? null : { name: r.operation.name, pathTemplate: r.operation.pathTemplate, pathParams: r.pathParams, query: r.query };
      expect(norm(matchRequest(adaW, op.request.method, url))).toEqual(norm(matchRequest(adaWo, op.request.method, url)));
    }
  });
});

/**
 * Claim 2 gate (C038): the journeys layer references operations only by stable HANDLE / NAME — never by a request VALUE.
 * Authored `.feature` argument slots carry the free human VALUES ("a pet named Fluffy", "$20"); those live ONLY in the
 * sidecar, never in any contract reference. A journeys reference that smelled like a JSON-pointer into a payload would
 * breach the same wall C018 puts around callback keys and C037 around store fields.
 */
describe("Claim 2 gate (C038): journeys references are handles/names, not request/response VALUE selectors", () => {
  const POINTER_SMELL = /^[#$]?\/|^\$\.|(^|\.)[A-Za-z_][\w]*\.[A-Za-z_]/;
  const facet = withJourneysFacet(petstore) as unknown as { ["x-suluk-journeys"]: Record<string, { handleSet: { operations: string[]; storeKeys: string[]; roles: string[]; statuses: string[] } }> };

  test("every handle-set member is a bare name / status / role — no payload pointer", () => {
    for (const flow of Object.values(facet["x-suluk-journeys"])) {
      const { operations, storeKeys, roles, statuses } = flow.handleSet;
      for (const s of [...operations, ...storeKeys, ...roles]) expect(POINTER_SMELL.test(s)).toBe(false);
      for (const s of statuses) expect(/^([1-5]\d\d|[1-5]xx|default)$/.test(s)).toBe(true);
    }
  });
});
