import { test, expect, describe } from "bun:test";
import { Context, Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { responseList } from "@suluk/hono";
import { op, envelope, pipeline, all, effectPipeRoute, NotFoundError, type CostModel } from "../src/index";

/**
 * `op` — a service function that IS a complete operation: it carries its OWN route identity (method/path/roles/summary)
 * alongside the wire contract + impl, so the function is defined ONCE at source and the route just mounts it. The impl runs
 * directly over a service tag (here `Store`, standing in for the base `Db`) — no separate Context.Tag "service" to wrap.
 */
interface ItemT { readonly id: string; readonly title: string }
const ItemSchema = z.object({ id: z.string(), title: z.string() }).describe("An item.");
class Store extends Context.Tag("Store")<Store, {
  readonly get: (id: string) => Effect.Effect<ItemT, InstanceType<typeof NotFoundError>>;
  readonly count: () => Effect.Effect<number>;
}>() {}
const StoreLive = (rows: Map<string, ItemT>) =>
  Layer.succeed(Store, {
    get: (id) => Effect.gen(function* () { const r = rows.get(id); if (!r) return yield* new NotFoundError({ resource: "item", id }); return r; }),
    count: () => Effect.sync(() => rows.size),
  });
const provideOf = (rows: Map<string, ItemT>) => <A, E>(_env: unknown, p: Effect.Effect<A, E, Store>) => p.pipe(Effect.provide(StoreLive(rows)));
const readCost: CostModel = { components: [], infra: { "d1.read": 1 }, settlement: { method: "rate-limited" } };

// the op carries its WHOLE operation identity + impl over Store (no wrapper service, no separate route declaration)
const getItem = op({
  method: "get", path: "/api/items/:id", name: "getItem", roles: ["signed-in"], summary: "Get one item.",
  wrap: envelope("item", ItemSchema), errors: [NotFoundError], cost: readCost,
  run: (ctx) => Effect.flatMap(Store, (s) => s.get(ctx.param("id")!)),
});
// a COMPOSED-only leaf — no standalone route identity, just a unit that fans in
const countItems = op({
  wrap: envelope("count", z.number().int()), cost: readCost,
  run: () => Effect.flatMap(Store, (s) => s.count()),
});

const mount = (r: { contract: { method: string; path: string }; handler: (c: import("hono").Context) => Response | Promise<Response> }) => {
  const app = new Hono();
  app.on(r.contract.method.toUpperCase(), r.contract.path, (c) => { (c as { set: (k: string, v: unknown) => void }).set("user", { id: "u-1" }); return r.handler(c); });
  return app;
};

describe("op — method/path/summary/roles come from the function's OWN meta (the route spec omits them)", () => {
  const rows = new Map<string, ItemT>([["a", { id: "a", title: "x" }]]);

  test("effectPipeRoute folds the entry op's meta for the route identity", () => {
    const { contract } = effectPipeRoute({ provide: provideOf(rows), pipeline: pipeline(getItem) });
    expect(contract.method).toBe("get");
    expect(contract.path).toBe("/api/items/:id");
    expect(contract.summary).toBe("Get one item.");
    expect(contract.scopes).toEqual(["items:read"]); // derived from roles:["signed-in"] + the path module segment
    // the op's own cost still bubbles (readCost + the one worker.request)
    expect(contract.cost?.infra).toEqual({ "d1.read": 1, "worker.request": 1 });
  });

  test("it renders over the op's Store impl — 200 { item }, missing → typed 404", async () => {
    const app = mount(effectPipeRoute({ provide: provideOf(rows), pipeline: pipeline(getItem) }));
    const ok = await app.request("/api/items/a");
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ item: { id: "a", title: "x" } });
    const missing = await app.request("/api/items/nope");
    expect(missing.status).toBe(404);
  });

  test("a bare op with no method/path throws unless the route supplies them", () => {
    expect(() => effectPipeRoute({ provide: provideOf(rows), pipeline: pipeline(countItems) })).toThrow(/method\/path/);
  });

  test("a COMPOSITE overrides the entry op's meta — explicit method/path win, and the ops still compose", () => {
    const { contract } = effectPipeRoute({
      method: "get", path: "/api/items/:id/detail", name: "detail", summary: "item + count", roles: ["signed-in"],
      provide: provideOf(rows), pipeline: all(getItem, countItems),
    });
    expect(contract.path).toBe("/api/items/:id/detail"); // overrides getItem's meta path
    const ok = responseList(contract.responses).find((r) => r.status === 200);
    const js = z.toJSONSchema(ok!.schema!) as unknown as { properties: Record<string, unknown> };
    expect(Object.keys(js.properties).sort()).toEqual(["count", "item"]); // both ops' envelopes zipped
    expect(contract.cost?.infra).toEqual({ "d1.read": 2, "worker.request": 1 }); // both leaf costs summed
  });
});
