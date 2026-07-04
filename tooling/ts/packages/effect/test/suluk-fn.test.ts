import { test, expect, describe } from "bun:test";
import { Context, Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { responseList } from "@suluk/hono";
import { sulukFn, model, view, listView, sulukRoute, NotFoundError, type CostModel } from "../src/index";

/**
 * THE SULUK FUNCTION — the composable v4-contract unit. A leaf carries a SLICE of the core `Request`; declaring `deps` MERGES
 * lower slices up (the bubbling). This proves a controller→service→model split maintains ONE surface: the response schema comes
 * from the model (state source), the 404 is declared ONCE at the service and bubbles to the controller's doc without
 * re-declaration, and `sulukRoute` projects the whole thing to a v4 contract + a live hono handler.
 */
interface ItemT { readonly id: string; readonly title: string }
const ItemSchema = z.object({ id: z.string(), title: z.string().describe("The item text.") }).describe("An item.");
class Store extends Context.Tag("Store")<Store, {
  readonly get: (id: string) => Effect.Effect<ItemT, InstanceType<typeof NotFoundError>>;
  readonly create: (title: string) => Effect.Effect<ItemT>;
}>() {}
const StoreLive = (rows: Map<string, ItemT>) =>
  Layer.succeed(Store, {
    get: (id) => Effect.gen(function* () { const r = rows.get(id); if (!r) return yield* new NotFoundError({ resource: "item", id }); return r; }),
    create: (title) => Effect.sync(() => { const r = { id: `id-${rows.size + 1}`, title }; rows.set(r.id, r); return r; }),
  });
const readCost: CostModel = { components: [], infra: { "d1.read": 1 }, settlement: { method: "rate-limited" } };
const writeCost: CostModel = { components: [], infra: { "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited", overflow: "credit" } };

// ── THE STACK — three layers, three slices that bubble into one Request ───────────────────────────────────────────────────
// MODEL (state source): the domain schema. In a real app this is `wireDto(item.zodSchema)` off a drizzle table.
const ItemModel = model(ItemSchema);
// SERVICE: business logic + the 404 (declared ONCE, where it is thrown). `Out` inferred from the Effect.
const getItemService = sulukFn({
  deps: { m: ItemModel }, errors: [NotFoundError], cost: readCost,
  run: (ctx, id: string) => Effect.flatMap(Store, (s) => s.get(id)),
});
// CONTROLLER + VIEW: the HTTP identity + the { item } wrap. Declares NO errors — the service's 404 bubbles up.
const getItem = sulukFn({
  deps: { svc: getItemService }, method: "get", path: "/api/items/:id", roles: ["signed-in"],
  summary: "Get one item.", view: view("item"),
  run: (ctx, _in, { svc }) => svc.run(ctx, ctx.param("id")!),
});

const mount = (r: { contract: { method: string; path: string }; handler: (c: import("hono").Context) => Response | Promise<Response> }) => {
  const app = new Hono();
  app.on(r.contract.method.toUpperCase(), r.contract.path, (c) => { (c as { set: (k: string, v: unknown) => void }).set("user", { id: "u-1" }); return r.handler(c); });
  return app;
};
const provideStore = (rows: Map<string, ItemT>) => <A, E>(_env: unknown, p: Effect.Effect<A, E, Store>) => p.pipe(Effect.provide(StoreLive(rows)));

describe("sulukFn — the slice BUBBLES up the controller→service→model stack into one Request", () => {
  test("the merged slice on the outermost fn carries every layer's contribution", () => {
    expect(getItem.slice.method).toBe("get");
    expect(getItem.slice.path).toBe("/api/items/:id");
    expect(getItem.slice.roles).toEqual(["signed-in"]);
    // errors bubbled from the SERVICE (the controller declared none) ↓
    expect(getItem.slice.errors?.map((e) => e.errorTag)).toEqual(["NotFoundError"]);
    // response schema bubbled from the MODEL (two layers down) ↓
    expect(getItem.slice.ok?.schema).toBe(ItemSchema);
    // cost bubbled from the SERVICE ↓
    expect(getItem.slice.cost?.infra).toEqual({ "d1.read": 1 });
  });

  test("sulukRoute derives the v4 contract — 200 { item } (view over the model schema) + 404 (bubbled) + role-implied 401", () => {
    const { contract } = sulukRoute(getItem, { provide: provideStore(new Map()) });
    const resps = responseList(contract.responses);
    const ok = resps.find((r) => r.status === 200);
    const js = z.toJSONSchema(ok!.schema!) as unknown as { properties: Record<string, unknown> };
    expect(Object.keys(js.properties)).toEqual(["item"]); // the view wrapped the model's domain schema
    expect(resps.find((r) => r.status === 404)?.schemaName).toBe("NotFoundError"); // declared at the SERVICE, in the doc
    expect(resps.find((r) => r.status === 401)?.schemaName).toBe("UnauthorizedError"); // from roles:["signed-in"]
    expect(contract.cost?.infra).toEqual({ "d1.read": 1, "worker.request": 1 }); // bubbled sum + the HTTP call
    expect(contract.scopes).toEqual(["items:read"]); // derived from roles + the path module segment
  });

  test("runtime — 200 { item } for a hit, typed 404 for a miss (the service's error bubbles to the wire)", async () => {
    const rows = new Map<string, ItemT>([["a", { id: "a", title: "x" }]]);
    const app = mount(sulukRoute(getItem, { provide: provideStore(rows) }));
    const ok = await app.request("/api/items/a");
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ item: { id: "a", title: "x" } });
    const miss = await app.request("/api/items/nope");
    expect(miss.status).toBe(404);
    expect(await miss.json()).toEqual({ resource: "item", id: "nope" });
  });
});

describe("sulukFn — a body-carrying create; the request body is the maintained surface", () => {
  const CreateReq = z.object({ title: z.string().min(1) });
  const createItemService = sulukFn({
    deps: { m: ItemModel }, cost: writeCost,
    run: (ctx, body: { title: string }) => Effect.flatMap(Store, (s) => s.create(body.title)),
  });
  const createItem = sulukFn({
    deps: { svc: createItemService }, method: "post", path: "/api/items", roles: ["signed-in"],
    summary: "Create an item.", body: CreateReq, validateBody: true, ok: { status: 201 }, view: view("item"),
    run: (ctx, body: { title: string }, { svc }) => svc.run(ctx, body),
  });

  test("request.json ← the controller's `body`; response 201 { item }; write cost bubbles", () => {
    const { contract } = sulukRoute(createItem, { provide: provideStore(new Map()) });
    expect(contract.request?.json).toBe(CreateReq);
    const ok = responseList(contract.responses).find((r) => r.status === 201);
    const js = z.toJSONSchema(ok!.schema!) as unknown as { properties: Record<string, unknown> };
    expect(Object.keys(js.properties)).toEqual(["item"]);
    expect(contract.cost?.infra).toEqual({ "d1.write": 1, "d1.read": 1, "worker.request": 1 });
  });

  test("runtime — POST creates and returns 201 { item }; a validation miss is a typed 400", async () => {
    const app = mount(sulukRoute(createItem, { provide: provideStore(new Map()) }));
    const created = await app.request("/api/items", { method: "POST", body: JSON.stringify({ title: "new" }), headers: { "content-type": "application/json" } });
    expect(created.status).toBe(201);
    expect(((await created.json()) as { item: ItemT }).item.title).toBe("new");
    const bad = await app.request("/api/items", { method: "POST", body: JSON.stringify({ title: "" }), headers: { "content-type": "application/json" } });
    expect(bad.status).toBe(400);
  });
});

describe("sulukFn — the drizzle→hono bridge: a db table IS the response schema (state source → api reference)", () => {
  test("model(createSelectSchema(table)) bubbles the db columns straight into the 200 body", async () => {
    // a REAL drizzle table — the state source. Its select schema is the domain schema the model bridges into the contract.
    const { sqliteTable, text, integer } = await import("drizzle-orm/sqlite-core");
    const { createSelectSchema } = await import("../src/index");
    const widget = sqliteTable("widget", {
      id: text("id").primaryKey(),
      label: text("label").notNull(),
      qty: integer("qty").notNull(),
    });
    interface Widget { id: string; label: string; qty: number }
    const WidgetModel = model(createSelectSchema(widget) as unknown as import("zod").z.ZodType<Widget>);

    class Widgets extends Context.Tag("Widgets")<Widgets, { readonly get: (id: string) => Effect.Effect<Widget, InstanceType<typeof NotFoundError>> }>() {}
    const getWidgetService = sulukFn({
      deps: { m: WidgetModel }, errors: [NotFoundError], cost: readCost,
      run: (ctx, id: string) => Effect.flatMap(Widgets, (w) => w.get(id)),
    });
    const getWidget = sulukFn({
      deps: { svc: getWidgetService }, method: "get", path: "/api/widgets/:id", roles: ["signed-in"],
      summary: "Get one widget.", view: view("widget"),
      run: (ctx, _in, { svc }) => svc.run(ctx, ctx.param("id")!),
    });

    const rows = new Map<string, Widget>([["w1", { id: "w1", label: "Bolt", qty: 3 }]]);
    const provide = <A, E>(_env: unknown, p: Effect.Effect<A, E, Widgets>) =>
      p.pipe(Effect.provide(Layer.succeed(Widgets, { get: (id) => Effect.gen(function* () { const r = rows.get(id); if (!r) return yield* new NotFoundError({ resource: "widget", id }); return r; }) })));

    const { contract } = sulukRoute(getWidget, { provide });
    const ok = responseList(contract.responses).find((r) => r.status === 200);
    // the DB columns (id/label/qty) bubbled up through model→service→controller into the wrapped { widget } body.
    const js = z.toJSONSchema(ok!.schema!) as unknown as { properties: { widget: { properties: Record<string, unknown> } } };
    expect(Object.keys(js.properties.widget.properties).sort()).toEqual(["id", "label", "qty"]);
    expect((js.properties.widget.properties.qty as { type: string }).type).toBe("integer"); // the db column type carried through
  });
});

describe("sulukFn — list / delete-with-body / composite fan-out (the behaviors the todo adoption exercises)", () => {
  interface Row { readonly id: string; readonly title: string }
  const RowSchema = z.object({ id: z.string(), title: z.string() }).describe("A row.");
  class Rows extends Context.Tag("Rows")<Rows, {
    readonly list: () => Effect.Effect<Row[]>;
    readonly get: (id: string) => Effect.Effect<Row, InstanceType<typeof NotFoundError>>;
    readonly count: () => Effect.Effect<number>;
    readonly remove: (id: string) => Effect.Effect<void, InstanceType<typeof NotFoundError>>;
  }>() {}
  const live = (m: Map<string, Row>) => Layer.succeed(Rows, {
    list: () => Effect.sync(() => [...m.values()]),
    get: (id) => Effect.gen(function* () { const r = m.get(id); if (!r) return yield* new NotFoundError({ resource: "row", id }); return r; }),
    count: () => Effect.sync(() => m.size),
    remove: (id) => Effect.gen(function* () { if (!m.delete(id)) return yield* new NotFoundError({ resource: "row", id }); }),
  });
  const RowModel = model(RowSchema);
  const provideRows = (m: Map<string, Row>) => <A, E>(_e: unknown, p: Effect.Effect<A, E, Rows>) => p.pipe(Effect.provide(live(m)));
  const mountR = (r: { contract: { method: string; path: string }; handler: (c: import("hono").Context) => Response | Promise<Response> }) => {
    const app = new Hono();
    app.on(r.contract.method.toUpperCase(), r.contract.path, (c) => { (c as { set: (k: string, v: unknown) => void }).set("user", { id: "u" }); return r.handler(c); });
    return app;
  };

  test("listView wraps the model schema → 200 { rows: [...] } at runtime", async () => {
    const listSvc = sulukFn({ deps: { m: RowModel }, run: (): Effect.Effect<Row[], never, Rows> => Effect.flatMap(Rows, (r) => r.list()) });
    const listCtrl = sulukFn({ deps: { svc: listSvc }, method: "get", path: "/api/rows", roles: ["signed-in"], summary: "list", view: listView("rows"), run: (ctx, _i, { svc }) => svc.run(ctx, undefined) });
    const res = await mountR(sulukRoute(listCtrl, { provide: provideRows(new Map([["a", { id: "a", title: "x" }]])) })).request("/api/rows");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ rows: [{ id: "a", title: "x" }] });
  });

  test("delete returns a body at 200 (not a 204 that drops it); a miss is the bubbled 404", async () => {
    const delSvc = sulukFn({ errors: [NotFoundError], run: (ctx, id: string): Effect.Effect<void, InstanceType<typeof NotFoundError>, Rows> => Effect.flatMap(Rows, (r) => r.remove(id)) });
    const delCtrl = sulukFn({ deps: { svc: delSvc }, method: "delete", path: "/api/rows/:id", roles: ["signed-in"], summary: "del", ok: { schema: z.object({ deleted: z.literal(true) }) }, run: (ctx, _i, { svc }) => Effect.map(svc.run(ctx, ctx.param("id")!), () => ({ deleted: true as const })) });
    const { contract } = sulukRoute(delCtrl, { provide: provideRows(new Map()) });
    expect(responseList(contract.responses).find((r) => r.status === 200)).toBeTruthy(); // 200, not 204
    const m = new Map<string, Row>([["a", { id: "a", title: "x" }]]);
    const app = mountR(sulukRoute(delCtrl, { provide: provideRows(m) }));
    const ok = await app.request("/api/rows/a", { method: "DELETE" });
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ deleted: true });
    const miss = await app.request("/api/rows/nope", { method: "DELETE" });
    expect(miss.status).toBe(404);
  });

  test("a composite controller fans two services into { row, count }; the 404 bubbles", async () => {
    const getSvc = sulukFn({ deps: { m: RowModel }, errors: [NotFoundError], run: (ctx, id: string) => Effect.flatMap(Rows, (r) => r.get(id)) });
    const countSvc = sulukFn({ ok: { schema: z.number().int() }, run: (): Effect.Effect<number, never, Rows> => Effect.flatMap(Rows, (r) => r.count()) });
    const detail = sulukFn({
      deps: { g: getSvc, c: countSvc }, method: "get", path: "/api/rows/:id/detail", roles: ["signed-in"], summary: "detail",
      ok: { schema: z.object({ row: RowSchema, count: z.number().int() }) },
      run: (ctx, _i, { g, c }) => Effect.gen(function* () { const row = yield* g.run(ctx, ctx.param("id")!); const n = yield* c.run(ctx, undefined); return { row, count: n }; }),
    });
    const { contract } = sulukRoute(detail, { provide: provideRows(new Map()) });
    expect(responseList(contract.responses).find((r) => r.status === 404)?.schemaName).toBe("NotFoundError"); // bubbled from getSvc
    const res = await mountR(sulukRoute(detail, { provide: provideRows(new Map([["a", { id: "a", title: "x" }]])) })).request("/api/rows/a/detail");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ row: { id: "a", title: "x" }, count: 1 });
  });
});
