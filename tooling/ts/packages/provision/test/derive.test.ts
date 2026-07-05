import { test, expect } from "bun:test";
import { deriveInstanceSpecs, defineProvision, plan } from "../src/index";
import type { InstanceSpec } from "../src/index";
import type { OpenAPIv4Document } from "@suluk/core";

/**
 * C101 — `deriveInstanceSpecs`: the OSB-artifact PROJECTOR, the analog of `@suluk/hono`'s `emitAsyncApi` but for
 * infrastructure. Proves the "author domain once, annotate broker intent, generate OSB artifacts" claim end-to-end:
 * a v4 document's `x-suluk-provision` facet projects into the EXACT `InstanceSpec[]` shape `defineProvision`/`plan`
 * already consume, unmodified.
 */

const DOC: OpenAPIv4Document = {
  openapi: "4.0.0",
  info: { title: "Widgets", version: "1.0.0" },
  paths: {},
  ["x-suluk-provision"]: {
    db: {
      service: "cloudflare-d1",
      name: "widgets-db",
      params: { migrations: ["0001_init.sql"] },
      bind: { database_id: "CLOUDFLARE_D1_ID" },
      protected: true,
    },
    token: {
      service: "cloudflare-token",
      name: "widgets-d1-token",
      params: { scope: "@db.database_id" },
      bind: { token: "CLOUDFLARE_D1_TOKEN" },
    },
  },
} as OpenAPIv4Document;

test("derives one InstanceSpec per x-suluk-provision entry, ref taken from the map key (not repeated in the value)", () => {
  const specs = deriveInstanceSpecs(DOC);
  expect(specs).toHaveLength(2);
  const db = specs.find((s) => s.ref === "db")!;
  expect(db).toEqual({
    ref: "db", service: "cloudflare-d1", name: "widgets-db",
    params: { migrations: ["0001_init.sql"] }, bind: { database_id: "CLOUDFLARE_D1_ID" }, protected: true,
  });
  const token = specs.find((s) => s.ref === "token")!;
  expect(token.params).toEqual({ scope: "@db.database_id" }); // the @<ref>.<key> binding reference survives verbatim
  expect(token.protected).toBeUndefined(); // omitted, not defaulted to false
});

test("an absent x-suluk-provision facet derives an empty, honest [] (mirrors emitAsyncApi's empty-surface case)", () => {
  const bare: OpenAPIv4Document = { openapi: "4.0.0", info: { title: "Bare", version: "0.0.0" }, paths: {} };
  expect(deriveInstanceSpecs(bare)).toEqual([]);
});

test("is a PURE function — same doc in, deep-equal specs out", () => {
  expect(deriveInstanceSpecs(DOC)).toEqual(deriveInstanceSpecs(DOC));
});

test("composes with the EXISTING engine unmodified: defineProvision + plan() consume derived specs exactly like a hand-authored fragment", () => {
  const derived = deriveInstanceSpecs(DOC);
  const config = defineProvision({ instances: derived }); // throws on dup ref / cycle — proves the DAG is well-formed
  const p = plan(config, []); // no live state yet -> every instance is a "create" step
  expect(p.steps).toHaveLength(2);
  expect(p.steps.every((s) => s.action === "create")).toBe(true);
  expect(p.steps.map((s) => s.ref).sort()).toEqual(["db", "token"]);
  expect(p.clean).toBe(false); // fresh creates are pending, not yet applied
});

test("a hand-authored InstanceSpec[] fragment and a derived one concatenate into one valid config", () => {
  const handAuthored: InstanceSpec[] = [{ ref: "kv", service: "cloudflare-kv", name: "widgets-kv" }];
  const derived = deriveInstanceSpecs(DOC);
  const config = defineProvision({ instances: [...handAuthored, ...derived] });
  expect(config.instances.map((s) => s.ref).sort()).toEqual(["db", "kv", "token"]);
});
