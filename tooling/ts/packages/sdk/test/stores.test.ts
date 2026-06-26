import { test, expect, describe } from "bun:test";
import { generateStores } from "../src/index";
import type { OpenAPIv4Document } from "@suluk/core";

// A contract carrying the C037 reactive facet: a plain query store (session), a cached query store (paymentMethods),
// a parameterized query store (pet/{id} → a factory), a mutation that invalidates + onSuccess, and a doc notify policy.
const doc = {
  openapi: "4.0.0-candidate",
  info: { title: "Store API" },
  "x-suluk-notify": { "2xx": "silent", "401": "silent", "402": "error", "4xx": "warn", "5xx": "error", network: "error" },
  paths: {
    session: { requests: { getSession: { method: "get", responses: { ok: { status: 200 } }, "x-suluk-store": { key: "session", ttl: 300, revalidateOnFocus: true } } } },
    paymentMethods: { requests: { listPaymentMethods: { method: "get", responses: { ok: { status: 200, contentSchema: { type: "object", properties: { methods: { type: "array", items: { type: "object", properties: { id: { type: "string" } } } } } } } }, "x-suluk-store": { key: "paymentMethods", ttl: 60 } } } },
    "billing/methods/default": { requests: { setDefaultPaymentMethod: { method: "post", contentSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }, responses: { ok: { status: 200 } }, "x-suluk-store": { invalidates: ["paymentMethods"], onSuccess: "Default card updated." } } } },
    "pet/{id}": { requests: { getPet: { method: "get", responses: { ok: { status: 200 } }, "x-suluk-store": { key: "pet", params: ["id"] } } } },
  },
} as unknown as OpenAPIv4Document;

describe("@suluk/sdk generateStores — a typed Nano Stores reactive layer from the C037 facet", () => {
  const stores = generateStores(doc);

  test("emits a self-contained @nanostores/query + hookable layer over the SDK client", () => {
    expect(stores).toContain('import { nanoquery } from "@nanostores/query"');
    expect(stores).toContain('import { createHooks, type Hookable } from "hookable"');
    expect(stores).toContain('import type { SulukClient } from "./sdk"'); // client TYPE only — self-contained
    expect(stores).toContain("export function createStores(client: SulukClient");
    expect(stores).toContain("const [createFetcherStore, , ctx] = nanoquery()");
    expect(stores).toContain("Requires: `npm i @nanostores/query nanostores hookable`");
  });

  test("STATES — a $<key> fetcher store per query op, typed off the client, with ttl/focus settings", () => {
    expect(stores).toContain('const $session = createFetcherStore<Awaited<ReturnType<SulukClient["session"]["get"]>>>(["@session"]');
    expect(stores).toContain("cacheLifetime: 300000"); // ttl seconds → ms
    expect(stores).toContain("revalidateOnFocus: true");
    expect(stores).toContain("client.session.get()"); // calls the EXACT SDK accessor (shared resolveOps)
    expect(stores).toContain('const $paymentMethods = createFetcherStore<Awaited<ReturnType<SulukClient["paymentMethods"]["list"]>>>(["@paymentMethods"]');
    expect(stores).toContain("cacheLifetime: 60000");
  });

  test("a parameterized query (path param) becomes a (…args)=>store factory keyed by the args", () => {
    expect(stores).toContain('const $pet = (...args: Parameters<SulukClient["pet"]["get"]>) =>');
    expect(stores).toContain('createFetcherStore<Awaited<ReturnType<SulukClient["pet"]["get"]>>>(["@pet", JSON.stringify(args)]');
    expect(stores).toContain("client.pet.get(...args)");
  });

  test("EVENTS — a mutation action invalidates the named stores on 2xx + fires mutation:success", () => {
    expect(stores).toContain('async function setDefaultPaymentMethod(...args: Parameters<SulukClient["methods"]["default_"]>)');
    expect(stores).toContain("const r = await client.methods.default_(...args);"); // matches the real SDK accessor
    expect(stores).toContain('_invalidate["paymentMethods"]?.();');
    expect(stores).toContain('await hooks.callHook("mutation:success", { op: "setDefaultPaymentMethod", invalidated: ["paymentMethods"] });');
    expect(stores).toContain("throw e;"); // propagation contract — re-throw after the error seam
    expect(stores).toContain('await hooks.callHook("mutation:settled"');
  });

  test("CALLBACKS — onSuccess rides the notify hook; the x-suluk-notify policy is compiled + classified", () => {
    expect(stores).toContain('detail: "Default card updated."');
    expect(stores).toContain("const NOTIFY: Record<string, NotifySeverity> = {"); // the policy compiled to a data map
    expect(stores).toContain('"402":"error"');
    expect(stores).toContain('"network":"error"');
    expect(stores).toContain('"2xx":"silent"');
    expect(stores).toContain("function classify(status: number | \"network\"): NotifySeverity");
    expect(stores).toContain('if (severity !== "silent") await hooks.callHook("notify"'); // policy decides; renderer injected
    expect(stores).toContain("export interface StoreHooks");
  });

  test("invalidators — exact .invalidate() for plain stores; prefix match for parameterized families", () => {
    expect(stores).toContain('"session": () => {');
    expect(stores).toContain("$session.invalidate()");
    expect(stores).toContain('ctx.invalidateKeys((k) => typeof k === "string" && k.startsWith("@pet"))'); // pet is parameterized
  });

  test("returns the stores + actions + hooks + ctx", () => {
    expect(stores).toContain("return { $session, $paymentMethods, $pet, actions: { setDefaultPaymentMethod }, report, hooks, ctx };");
    expect(stores).toContain("export type SulukStores = ReturnType<typeof createStores>");
  });

  test("clientModule option redirects the type import", () => {
    expect(generateStores(doc, { clientModule: "../lib/sdk" })).toContain('import type { SulukClient } from "../lib/sdk"');
  });

  test("the emitted source is syntactically valid TypeScript (transpiles clean)", () => {
    expect(() => new Bun.Transpiler({ loader: "tsx" }).transformSync(stores)).not.toThrow();
  });

  test("declares nothing for a contract with no reactive facet (no stores/actions)", () => {
    const bare = generateStores({ openapi: "4.0.0-candidate", info: { title: "Bare" }, paths: { ping: { requests: { getPing: { method: "get", responses: { ok: { status: 200 } } } } } } } as unknown as OpenAPIv4Document);
    expect(bare).toContain("// (no query stores declared)");
    expect(bare).toContain("// (no mutation actions declared)");
    expect(bare).toContain("return { actions: {  }, report, hooks, ctx };");
    expect(() => new Bun.Transpiler({ loader: "tsx" }).transformSync(bare)).not.toThrow();
  });
});
