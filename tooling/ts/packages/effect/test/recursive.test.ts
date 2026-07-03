import { test, expect, describe } from "bun:test";
import { Context, Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { responseList } from "@suluk/hono";
import {
  action, envelope, listEnvelope, seq, all, branch, chain,
  effectPipeRoute, NotFoundError, type CostModel,
} from "../src/index";

/**
 * RECURSIVE composition — seq/all/branch fold a plan TREE into ONE route, and the whole contract (request / response /
 * errors / cost / rate-limit) MERGES up the tree. This is the effect.ts-style bubbling for the Suluk v4 contract.
 */

interface ItemT { readonly id: string; readonly title: string }
const ItemSchema = z.object({ id: z.string(), title: z.string().describe("The item text.") }).describe("An item.");
class Store extends Context.Tag("Store")<Store, {
  readonly get: (id: string) => Effect.Effect<ItemT, InstanceType<typeof NotFoundError>>;
  readonly list: () => Effect.Effect<ItemT[]>;
  readonly create: (title: string) => Effect.Effect<ItemT>;
  readonly count: () => Effect.Effect<number>;
}>() {}
const StoreLive = (rows: Map<string, ItemT>) =>
  Layer.succeed(Store, {
    get: (id) => Effect.gen(function* () { const r = rows.get(id); if (!r) return yield* new NotFoundError({ resource: "item", id }); return r; }),
    list: () => Effect.sync(() => [...rows.values()]),
    create: (title) => Effect.sync(() => { const r = { id: `id-${rows.size + 1}`, title }; rows.set(r.id, r); return r; }),
    count: () => Effect.sync(() => rows.size),
  });
const mkProvide = (rows: Map<string, ItemT>) => <A, E>(_env: unknown, p: Effect.Effect<A, E, Store>) => p.pipe(Effect.provide(StoreLive(rows)));

// ── actions, each carrying its OWN cost + (some) rate-limit budget ────────────────────────────────────────────────────
const one = envelope("item", ItemSchema);
const many = listEnvelope("items", ItemSchema, { describe: "The items." });
const readCost: CostModel = { components: [], infra: { "d1.read": 1 }, settlement: { method: "rate-limited" } };

const getItem = action({
  output: ItemSchema, wrap: one, errors: [NotFoundError], cost: readCost,
  rateLimit: { windowMs: 60_000, maxRequests: 100, key: "principal" },
  run: (ctx) => Effect.flatMap(Store, (s) => s.get(ctx.param("id")!)),
});
const countItems = action({
  output: z.number(), wrap: envelope("count", z.number().describe("How many items.")), cost: readCost,
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" }, // TIGHTER than getItem
  run: () => Effect.flatMap(Store, (s) => s.count()),
});
const listItems = action({ output: ItemSchema.array(), wrap: many, cost: readCost, run: () => Effect.flatMap(Store, (s) => s.list()) });
const CreateReq = z.object({ title: z.string().min(1) });
const createItem = action({
  input: CreateReq, output: ItemSchema, wrap: one, status: 201,
  cost: { components: [], infra: { "d1.write": 1, "d1.read": 1 }, settlement: { method: "credit", credits: 2 } },
  run: (_c, body: { title: string }) => Effect.flatMap(Store, (s) => s.create(body.title)),
});

const base = { tags: ["Items"], roles: ["signed-in"] as const };
const mount = (r: { contract: { method: string; path: string }; handler: (c: import("hono").Context) => Response | Promise<Response> }) => {
  const app = new Hono();
  app.on(r.contract.method.toUpperCase(), r.contract.path, (c) => { (c as { set: (k: string, v: unknown) => void }).set("user", { id: "u-1" }); return r.handler(c); });
  return app;
};

describe("all — FAN OUT: two branches' envelopes ZIP into one merged wire body", () => {
  const rows = new Map<string, ItemT>([["id-1", { id: "id-1", title: "x" }]]);
  const spec = { method: "get" as const, path: "/api/items/:id", name: "getItemDetail", summary: "item + count", ...base, provide: mkProvide(rows), pipeline: all(getItem, countItems) };

  test("ok.schema MERGES the branch objects → { item, count } (doc)", () => {
    const { contract } = effectPipeRoute(spec);
    const ok = responseList(contract.responses).find((r) => r.status === 200);
    const js = z.toJSONSchema(ok!.schema!) as unknown as { properties: Record<string, unknown> };
    expect(Object.keys(js.properties).sort()).toEqual(["count", "item"]);
  });

  test("errors ← the UNION over the tree (getItem's 404 + role-implied 401)", () => {
    const resps = responseList(effectPipeRoute(spec).contract.responses);
    expect(resps.find((r) => r.status === 404)?.schemaName).toBe("NotFoundError");
    expect(resps.find((r) => r.status === 401)?.schemaName).toBe("UnauthorizedError");
  });

  test("runtime → 200 { item, count } (both branches rendered)", async () => {
    const res = await mount(effectPipeRoute(spec)).request("/api/items/id-1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ item: { id: "id-1", title: "x" }, count: 1 });
  });

  test("a branch failure (404) bubbles as the typed 404 for the whole fan-out", async () => {
    const res = await mount(effectPipeRoute(spec)).request("/api/items/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ resource: "item", id: "nope" });
  });

  test("a key COLLISION (two branches both produce { item }) fails LOUD at build", () => {
    expect(() => effectPipeRoute({ ...spec, pipeline: all(getItem, getItem) })).toThrow(/wire key "item"/);
  });
});

describe("cost BUBBLES UP — the route cost is the SUM of the composed leaves (the CostModel monoid)", () => {
  const rows = new Map<string, ItemT>();
  // RECURSION: a pipeline (`all`) nested inside a `seq` — create, then fan out list + count.
  const tree = seq(createItem, all(listItems, countItems));
  const { contract } = effectPipeRoute({ method: "post", path: "/api/items", name: "createThenSummarize", summary: "create + summarize", ...base, provide: mkProvide(rows), pipeline: tree, validateBody: true });

  test("infra ADDS across create(d1.write+d1.read) + list(d1.read) + count(d1.read), plus ONE worker.request", () => {
    expect(contract.cost?.infra).toEqual({ "d1.write": 1, "d1.read": 3, "worker.request": 1 });
  });

  test("settlement takes the STRONGEST method in the tree (create's `credit` beats the reads' `rate-limited`)", () => {
    expect(contract.cost?.settlement).toEqual({ method: "credit", credits: 2 });
  });

  test("request.json ← the ENTRY leaf (createItem) even though it is nested in a seq→all tree", () => {
    expect(contract.request?.json).toBe(CreateReq);
  });

  test("response ← the terminal `all` node's ZIPPED body { items, count }", () => {
    const ok = responseList(contract.responses).find((r) => r.status === 201);
    const js = z.toJSONSchema(ok!.schema!) as unknown as { properties: Record<string, unknown> };
    expect(Object.keys(js.properties).sort()).toEqual(["count", "items"]);
  });
});

describe("rate-limit BUBBLES UP — the route takes the TIGHTEST leaf budget; key is roles-owned", () => {
  test("all(getItem@100, countItems@30) → 30 (tightest), key principal (authed)", () => {
    const rows = new Map<string, ItemT>();
    const { contract } = effectPipeRoute({ method: "get", path: "/api/items/:id", name: "d", summary: "d", ...base, provide: mkProvide(rows), pipeline: all(getItem, countItems) });
    expect(contract.rateLimit).toMatchObject({ maxRequests: 30, windowMs: 60_000, key: "principal" });
  });

  test("a PUBLIC route keys the merged budget on ip", () => {
    const rows = new Map<string, ItemT>();
    const publicCount = { ...countItems };
    const { contract } = effectPipeRoute({ method: "get", path: "/api/items/:id", name: "d2", summary: "d", tags: ["Items"], roles: ["public"] as const, provide: mkProvide(rows), pipeline: all(getItem, publicCount) });
    expect(contract.rateLimit?.key).toBe("ip");
  });
});

describe("branch — CONDITIONAL: arms union their errors; the runtime picks on the input", () => {
  const rows = new Map<string, ItemT>([["id-9", { id: "id-9", title: "seed" }]]);
  // POST { title } → create when a title is present, else fall back to reading an id from the body.
  const readById = action({ input: z.object({ id: z.string() }), output: ItemSchema, wrap: one, errors: [NotFoundError], run: (_c, body: { id: string }) => Effect.flatMap(Store, (s) => s.get(body.id)) });
  const tree = branch((body: { title?: string; id?: string }) => !!body.title, createItem, readById);
  const spec = { method: "post" as const, path: "/api/items", name: "createOrRead", summary: "create or read", ...base, provide: mkProvide(rows), pipeline: tree, validateBody: false };

  test("errors ← BOTH arms (readById's 404) + role-implied 401", () => {
    const resps = responseList(effectPipeRoute(spec).contract.responses);
    expect(resps.find((r) => r.status === 404)?.schemaName).toBe("NotFoundError");
    expect(resps.find((r) => r.status === 401)?.schemaName).toBe("UnauthorizedError");
  });

  test("runtime picks the `then` arm (create) when title present → 201 { item }", async () => {
    const res = await mount(effectPipeRoute(spec)).request("/api/items", { method: "POST", body: JSON.stringify({ title: "new" }), headers: { "content-type": "application/json" } });
    expect(res.status).toBe(201);
    expect(((await res.json()) as { item: ItemT }).item.title).toBe("new");
  });

  test("runtime picks the `else` arm (readById) when no title → resolves the id", async () => {
    const res = await mount(effectPipeRoute(spec)).request("/api/items", { method: "POST", body: JSON.stringify({ id: "id-9" }), headers: { "content-type": "application/json" } });
    expect(res.status).toBe(201); // then-arm status is the documented one; body from the else arm
    expect(await res.json()).toEqual({ item: { id: "id-9", title: "seed" } });
  });
});

describe("seq/chain equivalence + recursion (a pipeline is a valid child)", () => {
  test("seq(a, b) threads a→b just like chain / pipeline; a pipeline nests as a step", () => {
    const rows = new Map<string, ItemT>();
    const twoStep = seq(createItem, all(listItems, countItems));
    const nested = chain(twoStep, getItem); // a pipeline as chain's first arg — RECURSION
    expect(nested.actions.length).toBe(4); // create, list, count, get — all leaves flattened
  });
});
