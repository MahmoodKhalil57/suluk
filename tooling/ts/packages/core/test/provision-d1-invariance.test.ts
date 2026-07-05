import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, buildAda, matchRequest } from "../src/index";

/**
 * D1 SAFETY GATE for C101 (`x-suluk-provision`) — the INDEPENDENT, MAINTAINED witness for the burhan claim
 * `d1_provision_facet_safe` (plan/facts/0osb-provision-facet.bn).
 *
 * `x-suluk-provision` is a top-level OPTIONAL vendor map (the C025 x-suluk-jobs move, extended to infrastructure
 * needs). D1 — the load-bearing invariant — says the DOM→ADA request→operation matcher MUST be statically + locally
 * decidable and must NEVER consult a provisioning field (provisioning is a build/deploy-time concern, never a
 * request-routing one). buildAda iterates `doc.paths` only; matchRequest reads only method + the compiled
 * path-template. This test ENFORCES that invariant as a regression tripwire: the moment anyone makes the matcher
 * read `x-suluk-provision` (or any provisioning field), the ADA stops being invariant to the block and this fails.
 *
 * Mirrors test/agents-d1-invariance.test.ts / store-d1-invariance.test.ts / resources-d1-invariance.test.ts exactly.
 */

const here = import.meta.dir;
const petstore = parseDocument(readFileSync(join(here, "conformance", "valid", "01-petstore.yaml"), "utf8"));

/** A representative `x-suluk-provision` block — a D1 database + a scoped token bound to it via `@db.database_id`. */
const PROVISION_BLOCK = {
  ["x-suluk-provision"]: {
    db: {
      service: "cloudflare-d1",
      name: "petstore-db",
      params: { migrations: ["0001_init.sql"] },
      bind: { database_id: "CLOUDFLARE_D1_ID" },
      protected: true,
      ["x-suluk-source"]: { file: "src/schema.ts", symbol: "petTable", kind: "drizzle-table" },
    },
    token: {
      service: "cloudflare-token",
      name: "petstore-d1-token",
      // if the matcher ever resolved this binding reference, invariance would break
      params: { scope: "@db.database_id" },
      bind: { token: "CLOUDFLARE_D1_TOKEN" },
    },
  },
};

const project = (ada: ReturnType<typeof buildAda>) => ({
  operations: ada.operations
    .map((o) => ({ pathTemplate: o.pathTemplate, name: o.name, method: o.request.method, signatureKey: o.signatureKey, tuple: o.tuple }))
    .sort((a, b) => (a.signatureKey + a.name).localeCompare(b.signatureKey + b.name)),
  collisions: ada.collisions.map((c) => ({ a: c.a.name, b: c.b.name, verdict: c.verdict })),
  signatureKeys: [...ada.bySignature.keys()].sort(),
});

const concrete = (tpl: string) => tpl.replace(/\{\?[^}]*\}/g, "").replace(/\{[^}]+\}/g, "x");

describe("D1 gate (C101): the request→operation matcher is INVARIANT to an x-suluk-provision block", () => {
  const withoutProvision = petstore;
  const withProvision = { ...petstore, ...PROVISION_BLOCK } as unknown as typeof petstore;

  test("buildAda yields an identical ADA with vs without x-suluk-provision", () => {
    expect(project(buildAda(withProvision))).toEqual(project(buildAda(withoutProvision)));
  });

  test("matchRequest resolves every operation identically with vs without x-suluk-provision", () => {
    const adaW = buildAda(withProvision);
    const adaWo = buildAda(withoutProvision);
    for (const op of adaWo.operations) {
      const url = concrete(op.pathTemplate);
      const method = op.request.method;
      const rW = matchRequest(adaW, method, url);
      const rWo = matchRequest(adaWo, method, url);
      const norm = (r: ReturnType<typeof matchRequest>) =>
        r === null ? null : { name: r.operation.name, pathTemplate: r.operation.pathTemplate, pathParams: r.pathParams, query: r.query };
      expect(norm(rW)).toEqual(norm(rWo));
    }
  });

  test("a provision block with a dangling binding reference (@unknown.key) still does not perturb the matcher (dangling-ref linting is deriveInstanceSpecs'/defineProvision's concern, never the matcher's)", () => {
    const dangling = {
      ...petstore,
      "x-suluk-provision": { orphan: { service: "cloudflare-kv", name: "x", params: { seed: "@nonexistent.field" } } },
    } as unknown as typeof petstore;
    expect(project(buildAda(dangling))).toEqual(project(buildAda(petstore)));
  });
});
