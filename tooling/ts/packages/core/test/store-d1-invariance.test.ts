import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, buildAda, matchRequest } from "../src/index";

/**
 * D1 SAFETY GATE for C037 (`x-suluk-store` + `x-suluk-notify`) — the INDEPENDENT, MAINTAINED witness for the burhan
 * claims `d1_store_selector_safe` + `store_no_request_value_selector` (plan/facts/0reactive.bn). The reactive facet is
 * a PER-OP `x-suluk-store` (on a Request) plus a DOC-LEVEL `x-suluk-notify` policy — both CLIENT-CODEGEN ONLY (read by
 * the @suluk/sdk reactive generator, never by any server path). D1 says the DOM→ADA request→operation matcher must be
 * statically + locally decidable and must NEVER consult either facet. buildAda iterates `doc.paths` only; matchRequest
 * reads only method + the compiled path-template — not `x-suluk-store`, not `x-suluk-notify`. The moment anyone makes
 * the matcher read either, the ADA stops being invariant and this fails. (Stronger than the agents/resources gates:
 * this facet feeds NO runtime-advisory selection either — its only consumer is the frontend codegen.)
 */

const here = import.meta.dir;
const petstore = parseDocument(readFileSync(join(here, "conformance", "valid", "01-petstore.yaml"), "utf8"));

/** A doc-level notify policy — keys are statuses / status-classes / "network"; values are severities. */
const NOTIFY_BLOCK = {
  "x-suluk-notify": { "2xx": "silent", "402": "error", "429": "warn", "4xx": "warn", "5xx": "error", network: "error" },
};

/** Inject a per-op `x-suluk-store` onto EVERY operation: a GET becomes a query store, a write invalidates it. */
function withStoreFacet(doc: typeof petstore): typeof petstore {
  const paths = JSON.parse(JSON.stringify(doc.paths)) as Record<string, { requests?: Record<string, { method: string; ["x-suluk-store"]?: unknown }> }>;
  for (const pi of Object.values(paths)) {
    for (const req of Object.values(pi.requests ?? {})) {
      // a query (key) for reads; a mutation (invalidates, onSuccess) for writes — every field is a name/scalar, never a request VALUE.
      req["x-suluk-store"] =
        req.method.toLowerCase() === "get"
          ? { key: "pets", ttl: 300, revalidateOnFocus: true, params: ["id"] }
          : { invalidates: ["pets"], onSuccess: "Saved." };
    }
  }
  return { ...doc, ...NOTIFY_BLOCK, paths } as unknown as typeof petstore;
}

const project = (ada: ReturnType<typeof buildAda>) => ({
  operations: ada.operations
    .map((o) => ({ pathTemplate: o.pathTemplate, name: o.name, method: o.request.method, signatureKey: o.signatureKey, tuple: o.tuple }))
    .sort((a, b) => (a.signatureKey + a.name).localeCompare(b.signatureKey + b.name)),
  collisions: ada.collisions.map((c) => ({ a: c.a.name, b: c.b.name, verdict: c.verdict })),
  signatureKeys: [...ada.bySignature.keys()].sort(),
});

const concrete = (tpl: string) => tpl.replace(/\{\?[^}]*\}/g, "").replace(/\{[^}]+\}/g, "x");

describe("D1 gate (C037): the request→operation matcher is INVARIANT to x-suluk-store / x-suluk-notify", () => {
  const withoutStore = petstore;
  const withStore = withStoreFacet(petstore);

  test("buildAda yields an identical ADA with vs without the reactive facet", () => {
    expect(project(buildAda(withStore))).toEqual(project(buildAda(withoutStore)));
  });

  test("matchRequest resolves every operation identically with vs without the reactive facet", () => {
    const adaW = buildAda(withStore);
    const adaWo = buildAda(withoutStore);
    for (const op of adaWo.operations) {
      const url = concrete(op.pathTemplate);
      const method = op.request.method;
      const norm = (r: ReturnType<typeof matchRequest>) =>
        r === null ? null : { name: r.operation.name, pathTemplate: r.operation.pathTemplate, pathParams: r.pathParams, query: r.query };
      expect(norm(matchRequest(adaW, method, url))).toEqual(norm(matchRequest(adaWo, method, url)));
    }
  });
});
