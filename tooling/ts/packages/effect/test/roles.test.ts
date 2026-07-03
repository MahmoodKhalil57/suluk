import { test, expect, describe } from "bun:test";
import { Effect } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { responseList } from "@suluk/hono";
import { effectRoute, UnauthorizedError, NotFoundError } from "../src/index";

/** C078 — `roles` opts a route into method-derived DEFAULTS (scope, cost, rate-limit, auth errors), all overridable. */

describe("effectRoute roles — scope / cost / rate-limit / auth-error DEFAULTS derived from roles + method", () => {
  const { contract } = effectRoute({
    method: "get", path: "/api/todos/:id", name: "getTodo", summary: "get a todo",
    tags: ["Todos"], roles: ["signed-in"],
    ok: { schema: z.object({ todo: z.object({ id: z.string() }) }), description: "The todo." },
    errors: [NotFoundError],
    run: (c) =>
      Effect.gen(function* () {
        const id = c.req.param("id")!;
        if (!id) return yield* new UnauthorizedError({ reason: "auth required" }); // allowed WITHOUT declaring it (roles)
        return { todo: { id } };
      }),
  });

  test("signed-in derives the `<module>:read` scope from the path (GET → read)", () => {
    expect(contract.scopes).toEqual(["todos:read"]);
  });
  test("cost defaults by method (a GET reads d1) and is settled rate-limited", () => {
    expect(contract.cost?.infra?.["d1.read"]).toBe(1);
    expect(contract.cost?.infra?.["d1.write"]).toBeUndefined();
    expect(contract.cost?.settlement?.method).toBe("rate-limited");
  });
  test("rate-limit defaults by method + audience (read 120/min, principal-keyed)", () => {
    expect(contract.rateLimit).toMatchObject({ maxRequests: 120, key: "principal" });
  });
  test("a typed 401 UnauthorizedError response is added from `roles` (no need to list it in errors)", () => {
    const resps = responseList(contract.responses);
    expect(resps.find((r) => r.status === 401)?.schemaName).toBe("UnauthorizedError");
    expect(resps.find((r) => r.status === 404)?.schemaName).toBe("NotFoundError"); // the explicit domain error stays
    expect(resps.find((r) => r.status === 200)?.schema).toBeDefined();
  });

  test("a WRITE (POST) derives the `:write` scope + a write cost + a tighter rate-limit", () => {
    const { contract: c } = effectRoute({
      method: "post", path: "/api/todos", name: "createTodo", summary: "create",
      roles: ["signed-in"], ok: { schema: z.object({ ok: z.literal(true) }) },
      run: () => Effect.succeed({ ok: true as const }),
    });
    expect(c.scopes).toEqual(["todos:write"]);
    expect(c.cost?.infra?.["d1.write"]).toBe(1);
    expect(c.rateLimit).toMatchObject({ maxRequests: 60, key: "principal" });
    expect(responseList(c.responses).some((r) => r.status === 201)).toBe(true); // POST → 201
  });

  test("public → NO scope + an IP-keyed rate-limit; no 401 synthesized from roles", () => {
    const { contract: c } = effectRoute({
      method: "get", path: "/api/todos", name: "publicList", summary: "public",
      roles: ["public"], ok: { schema: z.object({}) }, run: () => Effect.succeed({}),
    });
    expect(c.scopes).toBeUndefined();
    expect(c.rateLimit?.key).toBe("ip");
    expect(responseList(c.responses).some((r) => r.status === 401)).toBe(false);
  });

  test("admin → the `admin` scope + BOTH a 401 and a 403 typed response", () => {
    const { contract: c } = effectRoute({
      method: "post", path: "/api/admin/reset", name: "reset", summary: "admin",
      roles: ["admin"], ok: { schema: z.object({}) }, run: () => Effect.succeed({}),
    });
    expect(c.scopes).toEqual(["admin"]);
    const resps = responseList(c.responses);
    expect(resps.find((r) => r.status === 401)?.schemaName).toBe("UnauthorizedError");
    expect(resps.find((r) => r.status === 403)?.schemaName).toBe("ForbiddenError");
  });

  test("explicit scope/cost/rateLimit OVERRIDE the derived defaults", () => {
    const { contract: c } = effectRoute({
      method: "get", path: "/api/todos", name: "custom", summary: "custom",
      roles: ["signed-in"], scopes: ["custom:scope"],
      cost: { components: [], infra: { "worker.request": 1 }, settlement: { method: "free" } },
      rateLimit: { windowMs: 1000, maxRequests: 5, key: "ip" },
      ok: { schema: z.object({}) }, run: () => Effect.succeed({}),
    });
    expect(c.scopes).toEqual(["custom:scope"]);
    expect(c.cost?.settlement?.method).toBe("free");
    expect(c.rateLimit).toMatchObject({ maxRequests: 5, key: "ip" });
  });

  test("a role-LESS route is UNCHANGED (no auto cost/rate-limit) — backward compatible", () => {
    const { contract: c } = effectRoute({
      method: "get", path: "/api/x", name: "x", summary: "x",
      ok: { schema: z.object({}) }, run: () => Effect.succeed({}),
    });
    expect(c.cost).toBeUndefined();
    expect(c.rateLimit).toBeUndefined();
    expect(c.scopes).toBeUndefined();
  });

  test("the response DESCRIPTION defaults from the SCHEMA's own .describe() (no need to restate it on ok)", () => {
    const Body = z.object({ todo: z.object({ title: z.string().describe("the text") }) }).describe("The todo.");
    const { contract: c } = effectRoute({
      method: "get", path: "/api/todos/:id", name: "getTodo", summary: "get",
      roles: ["signed-in"], ok: { schema: Body }, run: () => Effect.succeed({ todo: { title: "x" } }),
    });
    const ok = responseList(c.responses).find((r) => r.status === 200);
    expect(ok?.description).toBe("The todo."); // read off Body.describe(...)
    // an explicit ok.description still WINS over the schema's
    const { contract: c2 } = effectRoute({
      method: "get", path: "/api/x", name: "x", summary: "x",
      ok: { schema: Body, description: "override" }, run: () => Effect.succeed({ todo: { title: "x" } }),
    });
    expect(responseList(c2.responses).find((r) => r.status === 200)?.description).toBe("override");
  });

  test("the response description bubbles up from the WRAPPED ENTITY's .describe() (a single-property wrapper)", () => {
    const Item = z.object({ id: z.string() }).describe("The todo.");
    const { contract: c } = effectRoute({
      method: "get", path: "/api/todos/:id", name: "getTodo", summary: "get",
      roles: ["signed-in"], ok: { schema: z.object({ todo: Item }) }, run: () => Effect.succeed({ todo: { id: "1" } }),
    });
    expect(responseList(c.responses).find((r) => r.status === 200)?.description).toBe("The todo.");
  });

  describe("roles auth GUARD — effectRoute 401s an anonymous caller ITSELF + injects a guaranteed userId", () => {
    const mount = (roles: readonly ("signed-in" | "public")[]) => {
      const { handler } = effectRoute({
        method: "get", path: "/api/todos", name: "listTodos", summary: "list", roles,
        ok: { schema: z.object({ userId: z.string() }) },
        // NOTE: no manual `caller`/null-check — the handler trusts the injected userId.
        run: (_c, { userId }) => Effect.succeed({ userId: userId ?? "anon" }),
      });
      const app = new Hono();
      app.get("/api/todos", (c) => { if (c.req.query("auth")) c.set("user", { id: "u-42" } as never); return handler(c); });
      return app;
    };

    test("signed-in + NO principal → 401 UnauthorizedError, the handler never runs", async () => {
      const res = await mount(["signed-in"]).request("/api/todos");
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ reason: "authentication required" });
    });
    test("signed-in + a principal → the handler runs with the injected userId", async () => {
      const res = await mount(["signed-in"]).request("/api/todos?auth=1");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ userId: "u-42" });
    });
    test("public → no guard (the handler runs even without a principal)", async () => {
      const res = await mount(["public"]).request("/api/todos");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ userId: "anon" });
    });
  });

  test("ok.schema is OPTIONAL — omit it and the success response carries only a status + description", () => {
    const { contract: c } = effectRoute({
      method: "get", path: "/api/ping", name: "ping", summary: "ping",
      ok: { description: "pong" }, run: () => Effect.succeed({ pong: true }),
    });
    const ok = responseList(c.responses).find((r) => r.status === 200);
    expect(ok?.description).toBe("pong");
    expect(ok?.schema).toBeUndefined();
  });
});
