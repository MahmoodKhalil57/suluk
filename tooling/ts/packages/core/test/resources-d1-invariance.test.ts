import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, buildAda, matchRequest } from "../src/index";

/**
 * D1 SAFETY GATE for C036 (`x-suluk-resources`) — the INDEPENDENT, MAINTAINED witness for the burhan claim
 * `d1_resources_selector_safe` (plan/facts/0resources.bn). The resources catalog is a top-level OPTIONAL
 * `x-suluk-resources` vendor map plus a by-name `resources` field on an agent — the SAME C025/C027 move. D1 says the
 * DOM→ADA request→operation matcher must be statically + locally decidable and must NEVER consult a resources field.
 * buildAda iterates `doc.paths` only; matchRequest reads only method + the compiled path-template. The moment anyone
 * makes the matcher read `x-suluk-resources` (or an agent's `resources`), the ADA stops being invariant and this fails.
 */

const here = import.meta.dir;
const petstore = parseDocument(readFileSync(join(here, "conformance", "valid", "01-petstore.yaml"), "utf8"));

/** A representative resources catalog + an agent that references it (the C036 shape: content-only, no model). */
const RESOURCES_BLOCK = {
  "x-suluk-resources": {
    deployChecklist: {
      description: "Production deployment checklist — load before a release.",
      kind: "instructions",
      provenance: { source: "https://example.com/skills/deploy-checklist", contentHash: "sha256-aa11", version: "2026-06-23" },
      trust: "author-declared",
    },
    styleGuide: {
      description: "Company style guide (reference doc).",
      kind: "reference",
      provenance: { source: "https://example.com/skills/style-guide", contentHash: "sha256-bb22" },
    },
  },
  "x-suluk-agents": {
    assistant: {
      description: "An assistant that can activate the deploy checklist on demand.",
      maxDepth: 0,
      skills: { chat: { model: ["m"], tier: "resident", provenance: { source: "https://x/i", contentHash: "sha256-cc33", version: "v" } } },
      routes: {},
      agents: {},
      resources: { deploy: { ref: "#/x-suluk-resources/deployChecklist" } }, // if the matcher ever read this, invariance breaks
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

describe("D1 gate (C036): the request→operation matcher is INVARIANT to an x-suluk-resources block", () => {
  const withoutResources = petstore;
  const withResources = { ...petstore, ...RESOURCES_BLOCK } as unknown as typeof petstore;

  test("buildAda yields an identical ADA with vs without x-suluk-resources", () => {
    expect(project(buildAda(withResources))).toEqual(project(buildAda(withoutResources)));
  });

  test("matchRequest resolves every operation identically with vs without x-suluk-resources", () => {
    const adaW = buildAda(withResources);
    const adaWo = buildAda(withoutResources);
    for (const op of adaWo.operations) {
      const url = concrete(op.pathTemplate);
      const method = op.request.method;
      const norm = (r: ReturnType<typeof matchRequest>) =>
        r === null ? null : { name: r.operation.name, pathTemplate: r.operation.pathTemplate, pathParams: r.pathParams, query: r.query };
      expect(norm(matchRequest(adaW, method, url))).toEqual(norm(matchRequest(adaWo, method, url)));
    }
  });
});
