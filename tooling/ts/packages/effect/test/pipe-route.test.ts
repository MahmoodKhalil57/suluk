import { test, expect, describe } from "bun:test";
import { Context, Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { responseList } from "@suluk/hono";
import {
  action, envelope, listEnvelope, fixedEnvelope, pipeline, chain,
  effectPipeRoute, NotFoundError, ConflictError,
} from "../src/index";

/**
 * effectPipeRoute — a route's `run` is a PIPELINE of service actions; the contract is WALKED off the pipeline's AST.
 * routes → services → db: each action's `run` calls a service TAG; the route's `provide` discharges it with the env.
 */

// ── a toy service (a Context.Tag + a Layer), mirroring the real Todo service shape ──────────────────────────────────
interface ItemT { readonly id: string; readonly title: string }
const ItemSchema = z.object({
  id: z.string().describe("the id"),
  title: z.string().describe("The item text.").meta({ examples: ["Buy milk"] }),
}).describe("An item.");
class Store extends Context.Tag("Store")<Store, {
  readonly get: (id: string) => Effect.Effect<ItemT, InstanceType<typeof NotFoundError>>;
  readonly create: (title: string) => Effect.Effect<ItemT>;
  readonly list: () => Effect.Effect<ItemT[]>;
  readonly remove: (id: string) => Effect.Effect<void, InstanceType<typeof NotFoundError>>;
}>() {}
const StoreLive = (rows: Map<string, ItemT>) =>
  Layer.succeed(Store, {
    get: (id) => Effect.gen(function* () { const r = rows.get(id); if (!r) return yield* new NotFoundError({ resource: "item", id }); return r; }),
    create: (title) => Effect.sync(() => { const r = { id: `id-${rows.size + 1}`, title }; rows.set(r.id, r); return r; }),
    list: () => Effect.sync(() => [...rows.values()]),
    remove: (id) => Effect.gen(function* () { if (!rows.delete(id)) return yield* new NotFoundError({ resource: "item", id }); }),
  });

// ── actions (schemas + impl fused; run calls the SERVICE) ──────────────────────────────────────────────────────────
const CreateReq = z.object({ title: z.string().min(1).max(50).describe("The item text.") });
const one = envelope("item", ItemSchema);
const many = listEnvelope("items", ItemSchema, { describe: "The items." });

const getItem = action({ wrap: one, errors: [NotFoundError], run: (ctx) => Effect.flatMap(Store, (s) => s.get(ctx.param("id")!)) });
const listItems = action({ wrap: many, run: () => Effect.flatMap(Store, (s) => s.list()) });
const createItem = action({ input: CreateReq, wrap: one, status: 201, run: (_c, body: { title: string }) => Effect.flatMap(Store, (s) => s.create(body.title)) });
const removeItem = action({ wrap: fixedEnvelope<void, { deleted: true }>(z.object({ deleted: z.literal(true) }).describe("Deleted."), { deleted: true }), status: 200, errors: [NotFoundError], run: (ctx) => Effect.flatMap(Store, (s) => s.remove(ctx.param("id")!)) });

const provide = <A, E>(rows: Map<string, ItemT>, p: Effect.Effect<A, E, Store>): Effect.Effect<A, E, never> => p.pipe(Effect.provide(StoreLive(rows)));
const mkProvide = (rows: Map<string, ItemT>) => <A, E>(_env: unknown, p: Effect.Effect<A, E, Store>) => provide(rows, p);

describe("effectPipeRoute — the contract is WALKED off the pipeline AST", () => {
  const rows = new Map<string, ItemT>();
  const base = { tags: ["Items"], roles: ["signed-in"] as const, provide: mkProvide(rows) };

  test("request.json ← the head action's input; ok.schema+status ← the terminal wrap; 201 for a create", () => {
    const { contract } = effectPipeRoute({ method: "post", path: "/api/items", name: "createItem", summary: "create", ...base, pipeline: pipeline(createItem) });
    // request bubbled from the action's input
    expect(contract.request?.json).toBe(CreateReq);
    const ok = responseList(contract.responses).find((r) => r.status === 201);
    expect(ok?.schema).toBe(one.schema); // the { item } envelope
    expect(ok?.schemaName).toBe("CreateItemOk");
  });

  test("errors ← the union of every action's httpError classes (+ the role-implied 401), deduped", () => {
    const { contract } = effectPipeRoute({ method: "get", path: "/api/items/:id", name: "getItem", summary: "get", ...base, pipeline: pipeline(getItem) });
    const resps = responseList(contract.responses);
    expect(resps.find((r) => r.status === 404)?.schemaName).toBe("NotFoundError"); // bubbled from the action
    expect(resps.find((r) => r.status === 401)?.schemaName).toBe("UnauthorizedError"); // role-implied
    expect(resps.filter((r) => r.status === 404).length).toBe(1); // deduped
  });

  test("roles STILL derive scope/cost/rate-limit (delegated to effectRoute unchanged)", () => {
    const { contract } = effectPipeRoute({ method: "get", path: "/api/items/:id", name: "getItem", summary: "get", ...base, pipeline: pipeline(getItem) });
    expect(contract.scopes).toEqual(["items:read"]);
    expect(contract.cost?.settlement?.method).toBe("rate-limited");
    expect(contract.rateLimit).toMatchObject({ maxRequests: 120, key: "principal" });
  });

  test("the response description + per-field examples BUBBLE via z.toJSONSchema off the walked schema", () => {
    const { contract } = effectPipeRoute({ method: "get", path: "/api/items/:id", name: "getItem", summary: "get", ...base, pipeline: pipeline(getItem) });
    const ok = responseList(contract.responses).find((r) => r.status === 200);
    expect(ok?.description).toBe("An item."); // single-key { item } unwraps to the entity's .describe(...)
    const js = z.toJSONSchema(ok!.schema!) as unknown as { properties: { item: { properties: { title: { description?: string; examples?: unknown[] } } } } };
    expect(js.properties.item.properties.title.description).toBe("The item text.");
    expect(js.properties.item.properties.title.examples).toEqual(["Buy milk"]);
  });

  // ── runtime render (routes → services → store). Mount at the REAL method+path so Hono extracts `:id`. ─────────────
  const mount = (r: { contract: { method: string; path: string }; handler: (c: import("hono").Context) => Response | Promise<Response> }) => {
    const app = new Hono();
    app.on(r.contract.method.toUpperCase(), r.contract.path, (c) => { (c as { set: (k: string, v: unknown) => void }).set("user", { id: "u-1" }); return r.handler(c); });
    return app;
  };

  test("create → 201 { item }, then get → 200 { item }, missing → typed 404 bubbled, delete → 200 { deleted:true }", async () => {
    const created = await mount(effectPipeRoute({ method: "post", path: "/api/items", name: "createItem", summary: "c", ...base, pipeline: pipeline(createItem), validateBody: true }))
      .request("/api/items", { method: "POST", body: JSON.stringify({ title: "Buy milk" }), headers: { "content-type": "application/json" } });
    expect(created.status).toBe(201);
    const id = ((await created.json()) as { item: ItemT }).item.id;

    const got = await mount(effectPipeRoute({ method: "get", path: "/api/items/:id", name: "getItem", summary: "g", ...base, pipeline: pipeline(getItem) })).request(`/api/items/${id}`);
    expect(got.status).toBe(200);
    expect((await got.json()) as { item: ItemT }).toEqual({ item: { id, title: "Buy milk" } });

    const missing = await mount(effectPipeRoute({ method: "get", path: "/api/items/:id", name: "getItem", summary: "g", ...base, pipeline: pipeline(getItem) })).request(`/api/items/nope`);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ resource: "item", id: "nope" });

    const del = await mount(effectPipeRoute({ method: "delete", path: "/api/items/:id", name: "removeItem", summary: "d", ...base, pipeline: pipeline(removeItem) })).request(`/api/items/${id}`, { method: "DELETE" });
    expect(del.status).toBe(200);
    expect(await del.json()).toEqual({ deleted: true });
  });

  test("validateBody → a typed 400 ValidationError (never a 500 defect) on a bad body", async () => {
    const res = await mount(effectPipeRoute({ method: "post", path: "/api/items", name: "createItem", summary: "c", ...base, pipeline: pipeline(createItem), validateBody: true }))
      .request("/api/items", { method: "POST", body: JSON.stringify({ title: "" }), headers: { "content-type": "application/json" } });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { issues: string[] }).issues.length).toBeGreaterThan(0);
  });

  test("list → 200 { items: [...] }", async () => {
    const rows2 = new Map<string, ItemT>([["a", { id: "a", title: "x" }]]);
    const res = await mount(effectPipeRoute({ method: "get", path: "/api/items", name: "listItems", summary: "l", tags: ["Items"], roles: ["signed-in"], provide: mkProvide(rows2), pipeline: pipeline(listItems) })).request("/api/items");
    expect(res.status).toBe(200);
    expect((await res.json()) as { items: ItemT[] }).toEqual({ items: [{ id: "a", title: "x" }] });
  });
});

describe("type-safety guarantees (compile-time)", () => {
  test("wrap MUST match run's domain — a single-item run with a list wrap is a compile error (no `output` field)", () => {
    // @ts-expect-error — run yields a single Item (Dom=Item), but wrap: listEnvelope wants Dom[] — must NOT typecheck
    const bad = action({ wrap: listEnvelope("items", ItemSchema), run: () => Effect.flatMap(Store, (s) => s.create("x")) });
    expect(bad).toBeDefined();
  });

  test("errors DRIVES the run's E channel — a run that fails with an UNDECLARED error is a compile error", () => {
    // @ts-expect-error — run fails with NotFoundError but `errors` omits it → the run's E channel violates `never`
    const bad = action({ wrap: one, run: (ctx) => Effect.flatMap(Store, (s) => s.get(ctx.param("id")!)) });
    expect(bad).toBeDefined();
  });

  test("provide MUST discharge the pipeline's requirement — a narrower provide is a compile error", () => {
    effectPipeRoute({
      method: "get", path: "/api/items", name: "listItems", summary: "l", roles: ["signed-in"],
      pipeline: pipeline(listItems), // needs R = Store
      // @ts-expect-error — provide typed to `never` can't discharge a pipeline requiring `Store`
      provide: <A, E>(_e: unknown, p: Effect.Effect<A, E, never>) => p,
    });
    expect(true).toBe(true);
  });
});

describe("review fixes — no-body-status default, head-only request, precise multi-tag requirement", () => {
  const rows = new Map<string, ItemT>([["a", { id: "a", title: "x" }]]);
  const mount = (r: { contract: { method: string; path: string }; handler: (c: import("hono").Context) => Response | Promise<Response> }) => {
    const app = new Hono();
    app.on(r.contract.method.toUpperCase(), r.contract.path, (c) => { (c as { set: (k: string, v: unknown) => void }).set("user", { id: "u-1" }); return r.handler(c); });
    return app;
  };

  test("FIX B: a body-carrying DELETE action that OMITS status:200 defaults to 200 (not 204) — body renders, doc is legal", async () => {
    const del = action({ wrap: fixedEnvelope<void, { deleted: true }>(z.object({ deleted: z.literal(true) }), { deleted: true }), errors: [NotFoundError], run: (ctx) => Effect.flatMap(Store, (s) => s.remove(ctx.param("id")!)) });
    const r = effectPipeRoute({ method: "delete", path: "/api/items/:id", name: "rm", summary: "d", roles: ["signed-in"], provide: mkProvide(new Map(rows)), pipeline: pipeline(del) });
    // contract: success at 200 WITH the body schema; NO 204 (a 204-with-body is illegal + drops the body)
    expect(responseList(r.contract.responses).find((x) => x.status === 200)?.schema).toBeDefined();
    expect(responseList(r.contract.responses).some((x) => x.status === 204)).toBe(false);
    // runtime: 200 with the { deleted:true } body (not 204 empty)
    const res = await mount(r).request("/api/items/a", { method: "DELETE" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: true });
  });

  test("FIX C: request.json comes from the HEAD only — a downstream action's input is NOT exposed as the request body", () => {
    const seed = action({ wrap: fixedEnvelope<string, { v: string }>(z.object({ v: z.string() }), { v: "" }), run: () => Effect.succeed("seed") });
    const consume = action({ input: z.string(), wrap: envelope("item", ItemSchema), run: (_c, prev: string) => Effect.succeed({ id: prev, title: "t" }) });
    const r = effectPipeRoute({ method: "post", path: "/api/x", name: "hx", summary: "x", roles: ["signed-in"], provide: <A, E>(_e: unknown, p: Effect.Effect<A, E, never>) => p, pipeline: pipeline(seed, consume) });
    expect(r.contract.request?.json).toBeUndefined(); // head (seed) has NO input → no request body documented (not consume.input)
  });

  test("FIX A: a 2-action pipeline across TWO tags has a PRECISE requirement — a forgetful provide is a compile error", () => {
    class Log extends Context.Tag("Log")<Log, { readonly note: (s: string) => Effect.Effect<string> }>() {}
    const a1 = action({ wrap: fixedEnvelope<string, { v: string }>(z.object({ v: z.string() }), { v: "" }), run: () => Effect.flatMap(Store, (s) => Effect.map(s.list(), (rs) => rs[0]?.id ?? "none")) });
    const a2 = action({ input: z.string(), wrap: envelope("item", ItemSchema), run: (_c, id: string) => Effect.flatMap(Log, (l) => Effect.map(l.note(id), () => ({ id, title: "t" }))) });
    effectPipeRoute({
      method: "post", path: "/api/y", name: "hy", summary: "y", roles: ["signed-in"],
      pipeline: pipeline(a1, a2), // typed overload → R = Store | Log (precise, NOT any)
      // @ts-expect-error — a provide discharging only Store (forgetting Log) must NOT compile now that R is precise
      provide: <A, E>(_e: unknown, p: Effect.Effect<A, E, Store>) => p.pipe(Effect.provide(StoreLive(new Map()))),
    });
    expect(true).toBe(true);
  });
});

describe("chain — a TYPED 2-step pipeline bubbles request from the head + response from the terminal", () => {
  // step 1 reads a body { from }, yields a string; step 2 consumes that string, yields an item.
  const FromReq = z.object({ from: z.string() });
  const resolveId = action({ input: FromReq, wrap: fixedEnvelope<string, { id: string }>(z.object({ id: z.string() }), { id: "" }), run: (_c, body: { from: string }) => Effect.succeed(body.from) });
  const fetchItem = action({ wrap: envelope("item", ItemSchema), errors: [ConflictError], run: (_c, id: string) => Effect.succeed({ id, title: "t" }) });
  const two = chain(resolveId, fetchItem);

  test("the AST has BOTH actions; head = resolveId (input), terminal = fetchItem (wrap + its errors)", () => {
    expect(two.actions.length).toBe(2);
    const rows = new Map<string, ItemT>();
    const { contract } = effectPipeRoute({ method: "post", path: "/api/x/:id", name: "twoStep", summary: "two", roles: ["signed-in"], provide: <A, E>(_e: unknown, p: Effect.Effect<A, E, never>) => p, pipeline: two });
    expect(contract.request?.json).toBe(FromReq); // from the HEAD
    const resps = responseList(contract.responses);
    expect(resps.find((r) => r.status === 201)?.schema).toBeDefined(); // { item } from the TERMINAL (POST → 201 default)
    expect(resps.find((r) => r.status === 409)?.schemaName).toBe("ConflictError"); // fetchItem's error bubbled
  });
});
