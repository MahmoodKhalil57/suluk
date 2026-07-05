import { test, expect, describe } from "bun:test";
import { Context, Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { responseList } from "@suluk/hono";
import { sulukFn, sulukFmt, view, listView, sulukRoute, NotFoundError, type CostModel } from "../src/index";

/**
 * THE SULUK FUNCTION + `sulukFmt` — every layer (MODEL / SERVICE / ROUTE) is a `sulukFn`; `sulukFmt` RUNS+FORMATS a pipeline of
 * them. Facts live on the leaf MODEL — cost DEFINED there, the by-id error declared once, the response schema from the state
 * source — and BUBBLE up through the service and route, which hand-declare NONE of them.
 */
interface ItemT { readonly id: string; readonly title: string }
const ItemSchema = z.object({ id: z.string(), title: z.string().describe("The item text.") }).describe("An item.");
class Store extends Context.Tag("Store")<Store, {
  readonly get: (id: string) => Effect.Effect<ItemT, InstanceType<typeof NotFoundError>>;
  readonly list: () => Effect.Effect<ItemT[]>;
  readonly create: (title: string) => Effect.Effect<ItemT>;
  readonly count: () => Effect.Effect<number>;
  readonly remove: (id: string) => Effect.Effect<void, InstanceType<typeof NotFoundError>>;
}>() {}
const StoreLive = (rows: Map<string, ItemT>) =>
  Layer.succeed(Store, {
    get: (id) => Effect.gen(function* () { const r = rows.get(id); if (!r) return yield* new NotFoundError({ resource: "item", id }); return r; }),
    list: () => Effect.sync(() => [...rows.values()]),
    create: (title) => Effect.sync(() => { const r = { id: `id-${rows.size + 1}`, title }; rows.set(r.id, r); return r; }),
    count: () => Effect.sync(() => rows.size),
    remove: (id) => Effect.gen(function* () { if (!rows.delete(id)) return yield* new NotFoundError({ resource: "item", id }); }),
  });
const readCost: CostModel = { components: [], infra: { "d1.read": 1 }, settlement: { method: "rate-limited" } };
const writeCost: CostModel = { components: [], infra: { "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited", overflow: "credit" } };
const deleteCost: CostModel = { components: [], infra: { "d1.write": 1 }, settlement: { method: "rate-limited", overflow: "credit" } };

// ── MODELS — sulukFns: the db query + the STATE-SOURCE facts (schema / cost / by-id error) on the slice. Cost lives HERE. ────
const findItem = sulukFn({ cost: readCost, errors: [NotFoundError], ok: { schema: ItemSchema }, run: (ctx, id: string) => Effect.flatMap(Store, (s) => s.get(id)) });
const listItemsM = sulukFn({ cost: readCost, ok: { schema: ItemSchema }, run: (): Effect.Effect<ItemT[], never, Store> => Effect.flatMap(Store, (s) => s.list()) });
const createItemM = sulukFn({ cost: writeCost, ok: { schema: ItemSchema }, run: (ctx, body: { title: string }) => Effect.flatMap(Store, (s) => s.create(body.title)) });
const countItemsM = sulukFn({ cost: readCost, ok: { schema: z.number().int() }, run: (): Effect.Effect<number, never, Store> => Effect.flatMap(Store, (s) => s.count()) });
const removeItemM = sulukFn({ cost: deleteCost, errors: [NotFoundError], run: (ctx, id: string): Effect.Effect<void, InstanceType<typeof NotFoundError>, Store> => Effect.flatMap(Store, (s) => s.remove(id)) });

// ── SERVICES — `sulukFmt` over models (thin here; the place business logic would go). NO cost/errors restated. ──────────────
const getItem = sulukFmt(findItem);

const mount = (r: { contract: { method: string; path: string }; handler: (c: import("hono").Context) => Response | Promise<Response> }) => {
  const app = new Hono();
  app.on(r.contract.method.toUpperCase(), r.contract.path, (c) => { (c as { set: (k: string, v: unknown) => void }).set("user", { id: "u-1" }); return r.handler(c); });
  return app;
};
const provideStore = (rows: Map<string, ItemT>) => <A, E>(_env: unknown, p: Effect.Effect<A, E, Store>) => p.pipe(Effect.provide(StoreLive(rows)));

describe("sulukFmt — cost DEFINED on the model bubbles through service→route with nothing restated", () => {
  // ROUTE — sulukFmt(controller, service). The controller declares ONLY its HTTP identity + view + how to extract the id.
  const getItemRoute = sulukFmt(
    sulukFn({ method: "get", path: "/api/items/:id", name: "getItem", roles: ["signed-in"], summary: "Get one item.", view: view("item"), run: (ctx) => Effect.succeed(ctx.param("id")!) }),
    getItem,
  );

  test("the route's merged slice inherited cost + errors + schema from the MODEL (never restated up the pipeline)", () => {
    expect(getItemRoute.slice.method).toBe("get");
    expect(getItemRoute.slice.cost?.infra).toEqual({ "d1.read": 1 });     // ← from findItem (the model)
    expect(getItemRoute.slice.errors?.map((e) => e.errorTag)).toEqual(["NotFoundError"]); // ← from findItem
    expect(getItemRoute.slice.ok?.schema).toBe(ItemSchema);               // ← from findItem
  });

  test("sulukRoute derives the v4 contract — 200 { item } + 404 (bubbled) + role-implied 401; cost summed + worker.request", () => {
    const { contract } = sulukRoute(getItemRoute, { provide: provideStore(new Map()) });
    const resps = responseList(contract.responses);
    const js = z.toJSONSchema(resps.find((r) => r.status === 200)!.schema!) as unknown as { properties: Record<string, unknown> };
    expect(Object.keys(js.properties)).toEqual(["item"]);
    expect(resps.find((r) => r.status === 404)?.schemaName).toBe("NotFoundError");
    expect(resps.find((r) => r.status === 401)?.schemaName).toBe("UnauthorizedError");
    expect(contract.cost?.infra).toEqual({ "d1.read": 1, "worker.request": 1 });
    expect(contract.scopes).toEqual(["items:read"]);
  });

  test("runtime — the pipeline threads controller→service→model: 200 { item } hit, typed 404 miss", async () => {
    const rows = new Map<string, ItemT>([["a", { id: "a", title: "x" }]]);
    const app = mount(sulukRoute(getItemRoute, { provide: provideStore(rows) }));
    const ok = await app.request("/api/items/a");
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ item: { id: "a", title: "x" } });
    const miss = await app.request("/api/items/nope");
    expect(miss.status).toBe(404);
    expect(await miss.json()).toEqual({ resource: "item", id: "nope" });
  });
});

describe("sulukFn.dedupe (C110) — REAL enforcement bubbling, unlike node.dedupe's graph-only reflection", () => {
  test("a model's own `dedupe` bubbles through service→route onto the emitted contract's `x-suluk-dedupe`", () => {
    const chargeM = sulukFn({
      cost: writeCost, ok: { schema: ItemSchema },
      dedupe: { ttlMs: 60_000, keySource: { header: "Idempotency-Key" } },
      run: (ctx, body: { title: string }) => Effect.flatMap(Store, (s) => s.create(body.title)),
    });
    const chargeRoute = sulukFmt(
      sulukFn({ method: "post", path: "/api/charges", name: "charge", roles: ["signed-in"], summary: "Charge.", body: z.object({ title: z.string() }), view: view("item"), run: (ctx) => Effect.succeed(ctx as never) }),
      sulukFmt(chargeM),
    );
    const { contract } = sulukRoute(chargeRoute, { provide: provideStore(new Map()) });
    expect(contract.dedupe).toEqual({ ttlMs: 60_000, keySource: { header: "Idempotency-Key" } });
  });

  test("absent by default — an ordinary route carries no dedupe facet", () => {
    const plainRoute = sulukFmt(
      sulukFn({ method: "get", path: "/api/items/:id", name: "getItemPlain", roles: ["signed-in"], summary: "Get one item.", view: view("item"), run: (ctx) => Effect.succeed(ctx.param("id")!) }),
      getItem,
    );
    const { contract } = sulukRoute(plainRoute, { provide: provideStore(new Map()) });
    expect(contract.dedupe).toBeUndefined();
  });
});

describe("sulukFmt — a create (body), a list (listView), a delete (200 body), a composite", () => {
  const CreateReq = z.object({ title: z.string().min(1) });
  const createRoute = sulukFmt(
    sulukFn({ method: "post", path: "/api/items", name: "createItem", roles: ["signed-in"], summary: "Create.", body: CreateReq, validateBody: true, ok: { status: 201 }, view: view("item"), run: (ctx, body: { title: string }) => Effect.succeed(body) }),
    sulukFmt(createItemM),
  );
  const listRoute = sulukFmt(
    sulukFn({ method: "get", path: "/api/items", name: "listItems", roles: ["signed-in"], summary: "List.", view: listView("items"), run: (ctx) => Effect.succeed(undefined) }),
    sulukFmt(listItemsM),
  );
  const deleteRoute = sulukFmt(
    sulukFn({ method: "delete", path: "/api/items/:id", name: "deleteItem", roles: ["signed-in"], summary: "Delete.", ok: { schema: z.object({ deleted: z.literal(true) }) }, run: (ctx) => Effect.succeed(ctx.param("id")!) }),
    sulukFn({ cost: deleteCost, errors: [NotFoundError], run: (ctx, id: string) => Effect.map(removeItemM.run(ctx, id), () => ({ deleted: true as const })) }),
  );
  // composite fan-out — `sulukFmt.all` runs TWO services on the same input; the { item, count } body + its schema are DERIVED.
  const detailRoute = sulukFmt(
    sulukFn({ method: "get", path: "/api/items/:id/detail", name: "detail", roles: ["signed-in"], summary: "Item + count.", run: (ctx) => Effect.succeed(ctx.param("id")!) }),
    sulukFmt.all({ item: getItem, count: sulukFmt(countItemsM) }),
  );

  test("create — request.json ← the body; 201 { item }; write cost bubbled from the model", () => {
    const { contract } = sulukRoute(createRoute, { provide: provideStore(new Map()) });
    expect(contract.request?.json).toBe(CreateReq);
    expect(contract.cost?.infra).toEqual({ "d1.write": 1, "d1.read": 1, "worker.request": 1 });
    const ok = responseList(contract.responses).find((r) => r.status === 201);
    expect(Object.keys((z.toJSONSchema(ok!.schema!) as { properties: Record<string, unknown> }).properties)).toEqual(["item"]);
  });

  test("runtime — create 201, list 200 { items }, delete 200 { deleted }, miss 404", async () => {
    const rows = new Map<string, ItemT>([["a", { id: "a", title: "x" }]]);
    const created = await mount(sulukRoute(createRoute, { provide: provideStore(rows) })).request("/api/items", { method: "POST", body: JSON.stringify({ title: "new" }), headers: { "content-type": "application/json" } });
    expect(created.status).toBe(201);
    expect(((await created.json()) as { item: ItemT }).item.title).toBe("new");

    const listed = await mount(sulukRoute(listRoute, { provide: provideStore(rows) })).request("/api/items");
    expect(listed.status).toBe(200);
    expect(((await listed.json()) as { items: ItemT[] }).items.length).toBe(2);

    const del = mount(sulukRoute(deleteRoute, { provide: provideStore(rows) }));
    const ok = await del.request("/api/items/a", { method: "DELETE" });
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ deleted: true });
    expect((await del.request("/api/items/nope", { method: "DELETE" })).status).toBe(404);
  });

  test("delete route defaults to 200 (not 204) so the { deleted } body survives", () => {
    const { contract } = sulukRoute(deleteRoute, { provide: provideStore(new Map()) });
    expect(responseList(contract.responses).find((r) => r.status === 200)).toBeTruthy();
    expect(responseList(contract.responses).find((r) => r.status === 204)).toBeFalsy();
  });

  test("composite — sulukFmt.all DERIVES the { item, count } schema; the 404 bubbles from the get service's model", async () => {
    const { contract } = sulukRoute(detailRoute, { provide: provideStore(new Map()) });
    const ok = responseList(contract.responses).find((r) => r.status === 200);
    expect(Object.keys((z.toJSONSchema(ok!.schema!) as { properties: Record<string, unknown> }).properties).sort()).toEqual(["count", "item"]); // derived from the branches, not restated
    expect(responseList(contract.responses).find((r) => r.status === 404)?.schemaName).toBe("NotFoundError");
    expect(contract.cost?.infra).toEqual({ "d1.read": 2, "worker.request": 1 }); // both branches' read cost SUMmed
    const res = await mount(sulukRoute(detailRoute, { provide: provideStore(new Map([["a", { id: "a", title: "x" }]])) })).request("/api/items/a/detail");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ item: { id: "a", title: "x" }, count: 1 });
  });
});

describe("sulukFmt — the drizzle→hono bridge: a model over a db table carries the columns into the response", () => {
  test("a model whose ok.schema is a table's select schema bubbles the db columns into the 200 body", async () => {
    const { sqliteTable, text, integer } = await import("drizzle-orm/sqlite-core");
    const { createSelectSchema } = await import("../src/index");
    const widget = sqliteTable("widget", { id: text("id").primaryKey(), label: text("label").notNull(), qty: integer("qty").notNull() });
    interface Widget { id: string; label: string; qty: number }
    class Widgets extends Context.Tag("Widgets")<Widgets, { readonly get: (id: string) => Effect.Effect<Widget, InstanceType<typeof NotFoundError>> }>() {}
    const rows = new Map<string, Widget>([["w1", { id: "w1", label: "Bolt", qty: 3 }]]);
    const provide = <A, E>(_e: unknown, p: Effect.Effect<A, E, Widgets>) =>
      p.pipe(Effect.provide(Layer.succeed(Widgets, { get: (id) => Effect.gen(function* () { const r = rows.get(id); if (!r) return yield* new NotFoundError({ resource: "widget", id }); return r; }) })));

    // MODEL: cost + errors + the DB SELECT schema, doing the query.
    const findWidget = sulukFn({ cost: readCost, errors: [NotFoundError], ok: { schema: createSelectSchema(widget) as unknown as z.ZodType<Widget> }, run: (ctx, id: string) => Effect.flatMap(Widgets, (w) => w.get(id)) });
    const getWidget = sulukFmt(
      sulukFn({ method: "get", path: "/api/widgets/:id", name: "getWidget", roles: ["signed-in"], summary: "Get.", view: view("widget"), run: (ctx) => Effect.succeed(ctx.param("id")!) }),
      sulukFmt(findWidget),
    );
    const ok = responseList(sulukRoute(getWidget, { provide }).contract.responses).find((r) => r.status === 200);
    const js = z.toJSONSchema(ok!.schema!) as unknown as { properties: { widget: { properties: Record<string, unknown> } } };
    expect(Object.keys(js.properties.widget.properties).sort()).toEqual(["id", "label", "qty"]);
    expect((js.properties.widget.properties.qty as { type: string }).type).toBe("integer");
  });
});

describe("sulukFmt — authored BDD `step`s accumulate up the pipeline into the contract's x-suluk-scenario", () => {
  test("a model's given + a controller's when bubble to the merged slice + onto the contract, deduped", () => {
    const findThing = sulukFn({
      cost: readCost, errors: [NotFoundError], ok: { schema: ItemSchema },
      step: { role: "given", text: "a thing the caller owns exists" },
      run: (ctx, id: string) => Effect.flatMap(Store, (s) => s.get(id)),
    });
    const thingSvc = sulukFmt(findThing);
    const getThing = sulukFmt(
      sulukFn({ method: "get", path: "/api/things/:id", name: "getThing", roles: ["signed-in"], summary: "Get.", view: view("thing"),
        step: { role: "when", text: "they open the thing" }, run: (ctx) => Effect.succeed(ctx.param("id")!) }),
      thingSvc,
    );
    // the route's merged slice carries BOTH steps (given from the model, when from the controller)
    expect(getThing.slice.steps).toEqual([
      { role: "when", text: "they open the thing" },
      { role: "given", text: "a thing the caller owns exists" },
    ]);
    // sulukRoute stamps them as the contract's scenario facet — with the auth Given DERIVED from roles + prepended.
    const { contract } = sulukRoute(getThing, { provide: provideStore(new Map()) });
    expect((contract as { scenario?: unknown }).scenario).toEqual([
      { role: "given", text: "I am a signed-in user" },
      { role: "when", text: "they open the thing" },
      { role: "given", text: "a thing the caller owns exists" },
    ]);
  });

  test("sulukFmt.all concatenates + dedupes branch steps (a shared model given appears once)", () => {
    const g = { role: "given" as const, text: "the caller is set up" };
    const a = sulukFn({ ok: { schema: ItemSchema }, step: [g, { role: "then", text: "the item is shown" }], run: () => Effect.flatMap(Store, (s) => s.get("a")) });
    const b = sulukFn({ ok: { schema: z.number().int() }, step: [g, { role: "then", text: "the count is shown" }], run: () => Effect.flatMap(Store, (s) => s.count()) });
    const fan = sulukFmt.all({ item: a, count: b });
    expect(fan.slice.steps).toEqual([
      { role: "given", text: "the caller is set up" }, // deduped — appeared on both branches
      { role: "then", text: "the item is shown" },
      { role: "then", text: "the count is shown" },
    ]);
  });
})

describe("x-suluk-store (C037) — the reactive-store facet bubbles like cost, invalidates UNION", () => {
  // read models BACK a store (key); write models INVALIDATE (invalidates). Declared on the model, restated nowhere above.
  const findWithStore = sulukFn({ cost: readCost, ok: { schema: ItemSchema }, store: { key: "items", params: ["id"] }, run: (ctx, id: string) => Effect.flatMap(Store, (s) => s.get(id)) });
  const createWithStore = sulukFn({ cost: writeCost, ok: { schema: ItemSchema }, store: { invalidates: ["items"] }, run: (ctx, body: { title: string }) => Effect.flatMap(Store, (s) => s.create(body.title)) });

  test("a read model's key + params bubble to the route's merged slice + contract (first-wins)", () => {
    const route = sulukFmt(
      sulukFn({ method: "get", path: "/api/items/:id", roles: ["signed-in"], summary: "Get one.", view: view("item"), run: (ctx) => Effect.succeed(ctx.param("id")!) }),
      sulukFmt(findWithStore),
    );
    expect(route.slice.store).toEqual({ key: "items", params: ["id"] });
    const { contract } = sulukRoute(route, { provide: provideStore(new Map()) });
    expect((contract as { store?: unknown }).store).toEqual({ key: "items", params: ["id"] });
  });

  test("a write model's invalidates bubble to the route contract", () => {
    const route = sulukFmt(
      sulukFn({ method: "post", path: "/api/items", roles: ["signed-in"], summary: "Create.", view: view("item"), run: (ctx, body: { title: string }) => Effect.succeed(body) }),
      sulukFmt(createWithStore),
    );
    expect(route.slice.store).toEqual({ invalidates: ["items"] });
  });

  test("invalidates UNION (deduped) across layers; key stays first-wins", () => {
    const m1 = sulukFn({ ok: { schema: ItemSchema }, store: { key: "items", invalidates: ["a"] }, run: () => Effect.flatMap(Store, (s) => s.get("x")) });
    const m2 = sulukFn({ store: { invalidates: ["a", "b"] }, run: () => Effect.succeed(undefined) });
    const merged = sulukFmt(m1, m2);
    expect(merged.slice.store).toEqual({ key: "items", invalidates: ["a", "b"] });
  });

  test("sulukFmt.all UNIONs branch invalidates but DROPS branch keys (a composite has no single key)", () => {
    const a = sulukFn({ ok: { schema: ItemSchema }, store: { key: "item", invalidates: ["x"] }, run: () => Effect.flatMap(Store, (s) => s.get("a")) });
    const b = sulukFn({ ok: { schema: z.number().int() }, store: { key: "count", invalidates: ["y"] }, run: () => Effect.flatMap(Store, (s) => s.count()) });
    const fan = sulukFmt.all({ item: a, count: b });
    expect(fan.slice.store).toEqual({ invalidates: ["x", "y"] }); // no `key` — the composite gets its own at the controller if needed
  });

  test("a store-less pipeline emits no store on the contract", () => {
    const route = sulukFmt(sulukFn({ method: "get", path: "/api/plain", roles: ["signed-in"], summary: "Plain.", ok: { schema: ItemSchema }, run: () => Effect.flatMap(Store, (s) => s.get("a")) }));
    const { contract } = sulukRoute(route, { provide: provideStore(new Map()) });
    expect((contract as { store?: unknown }).store).toBeUndefined();
  });
})
