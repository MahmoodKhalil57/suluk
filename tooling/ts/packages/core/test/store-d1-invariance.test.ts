import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, buildAda, matchRequest } from "../src/index";
import type { SulukStore } from "../src/index";

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

/**
 * CLAIM 2 GATE for C037 (`store_no_request_value_selector`) — the SECOND, equally load-bearing D1 claim, given its own
 * maintained witness per the council parity review (2026-06-26). A facet field must name an author-chosen STORE NAME, a
 * param NAME, a config scalar, an advisory message, or an HTTP status/class — NEVER a JSON-pointer/path that EXTRACTS a
 * request/response VALUE. The tempting state-shaping extensions (pagination nextCursorPtr/hasMorePtr, an optimistic
 * idFrom, an entity keyFields-as-extractor) would be matcher-invisible yet breach this wall (a response value feeding a
 * later request); they belong in the injected adapter seam, never the contract. This test trips if any such field is
 * added to SulukStore, OR if any field value smells like a JSON pointer.
 */
describe("Claim 2 gate (C037): no x-suluk-store / x-suluk-notify field is a request/response VALUE selector", () => {
  // TYPE-LINKED exhaustiveness: classify EVERY real SulukStore field (excluding the `x-*` ext index) as a name, a
  // scalar, or a message — none is a value-EXTRACTOR. Adding a field to SulukStore (e.g. a `nextCursorPtr` / `idFrom`
  // value selector) FAILS TO COMPILE here until it is classified, forcing an explicit reviewed decision — so the
  // witness derives from the type, not a hand-kept list (the council's defect-find). ALLOWED is derived from it.
  const FIELD_KIND: Record<Exclude<keyof SulukStore, `x-${string}`>, "name" | "scalar" | "message"> = {
    key: "name",
    params: "name",
    invalidates: "name",
    ttl: "scalar",
    revalidateOnFocus: "scalar",
    onSuccess: "message",
  };
  const ALLOWED_STORE_FIELDS = new Set(Object.keys(FIELD_KIND));
  // A JSON-pointer / path smell: a string that points INTO a payload ("/data/0/id", "#/data", "$.data.id", "data.id").
  const POINTER_SMELL = /^[#$]?\/|^\$\.|(^|\.)[A-Za-z_][\w]*\.[A-Za-z_]/;

  const fullStore = { key: "pets", ttl: 300, revalidateOnFocus: true, params: ["id", "page"], invalidates: ["pets", "owners"], onSuccess: "Saved." };
  const notify = { "2xx": "silent", "402": "error", "4xx": "warn", "5xx": "error", network: "error" } as const;

  test("a fully-populated x-suluk-store uses ONLY allowed (non-extracting) fields", () => {
    for (const k of Object.keys(fullStore)) expect(ALLOWED_STORE_FIELDS.has(k)).toBe(true);
  });

  test("no string value in x-suluk-store is a JSON-pointer/path into a payload", () => {
    const strings = [fullStore.key, ...(fullStore.params ?? []), ...(fullStore.invalidates ?? []), fullStore.onSuccess].filter((x): x is string => typeof x === "string");
    for (const s of strings) expect(POINTER_SMELL.test(s)).toBe(false);
  });

  test("x-suluk-notify keys are statuses/classes/network and values are severities — never payload selectors", () => {
    const SEV = new Set(["silent", "info", "success", "warn", "error"]);
    for (const [k, v] of Object.entries(notify)) {
      expect(/^([1-5]\d\d|[1-5]xx|network)$/.test(k)).toBe(true);
      expect(SEV.has(v)).toBe(true);
    }
  });
});
