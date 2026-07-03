import { test, expect, describe } from "bun:test";
import { Hono } from "hono";
import { routeGroup, isRouteGroup, contractDoc, emitV4, type DocumentedRoute, type HandlerRoute } from "../src/index";

/** A tiny handler-backed route (the `{ contract, handler }` shape `effectRoute` returns), so this test needs no @suluk/effect. */
const route = (method: DocumentedRoute["method"], path: string, name: string, body: unknown, status = 200): HandlerRoute => ({
  contract: { method, path, name, summary: `${name} route`, responses: [{ status, description: "ok", schema: undefined }] },
  handler: (c) => c.json(body as never, status as never),
});

describe("routeGroup — the envelope bubbles up into .ops (the contract) + .router() (the mount)", () => {
  test(".ops is the contract fragment: every handler route + every doc-only op, in author order", () => {
    const g = routeGroup("/api/credits");
    g.doc({ method: "get", path: "/api/credits", name: "getCredits", summary: "own balance", responses: [{ status: 200, description: "balance" }] });
    g.route(route("get", "/api/credits/balance/:userId", "getUserCredits", { balance: 5 }));
    g.route(route("post", "/api/credits/debit", "debitCredits", { ok: true }, 200));

    expect(g.ops.map((o) => o.name)).toEqual(["getCredits", "getUserCredits", "debitCredits"]);
  });

  test(".router() mounts each HANDLER route at its basePath-relative sub-path; the doc-only op is NOT mounted", async () => {
    const g = routeGroup("/api/credits");
    g.doc({ method: "get", path: "/api/credits", name: "getCredits", summary: "own balance", responses: [{ status: 200, description: "b" }] });
    g.route(route("get", "/api/credits/balance/:userId", "getUserCredits", { balance: 7 }));
    g.route(route("post", "/api/credits/debit", "debitCredits", { ok: true }));

    const app = new Hono();
    app.route("/api/credits", g.router());

    const bal = await app.request("/api/credits/balance/u1");
    expect(bal.status).toBe(200);
    expect(await bal.json()).toEqual({ balance: 7 });

    const debit = await app.request("/api/credits/debit", { method: "POST" });
    expect(debit.status).toBe(200);
    expect(await debit.json()).toEqual({ ok: true });

    // the doc-only op has no handler here → 404 over the wire (the matcher resolves it elsewhere).
    const own = await app.request("/api/credits");
    expect(own.status).toBe(404);
  });

  test("mountOnly — a route is MOUNTED but NOT in .ops (mounted-but-undocumented, e.g. email verify)", async () => {
    const g = routeGroup("/api/email");
    g.route(route("post", "/api/email/send", "sendEmail", { ok: true }));
    g.mountOnly(route("post", "/api/email/verify", "verifyEmail", { ok: true }));

    // documented surface excludes verify…
    expect(g.ops.map((o) => o.name)).toEqual(["sendEmail"]);

    // …but BOTH handlers are mounted.
    const app = new Hono();
    app.route("/api/email", g.router());
    expect((await app.request("/api/email/send", { method: "POST" })).status).toBe(200);
    expect((await app.request("/api/email/verify", { method: "POST" })).status).toBe(200);
  });

  test(".route() returns the route unchanged, so a local reference still works", () => {
    const g = routeGroup("/api/x");
    const r = route("post", "/api/x/y", "xy", { ok: true });
    expect(g.route(r)).toBe(r);
  });

  test("isRouteGroup distinguishes a group from a plain contract", () => {
    expect(isRouteGroup(routeGroup("/api/x"))).toBe(true);
    expect(isRouteGroup({ method: "get", path: "/api/x", name: "x", summary: "s" })).toBe(false);
    expect(isRouteGroup(null)).toBe(false);
  });
});

describe("contractDoc — @suluk/hono auto-reads an envelope (flattens a group's .ops)", () => {
  test("a mix of documented routes + groups flattens organically", () => {
    const g = routeGroup("/api/credits");
    g.route(route("get", "/api/credits/balance/:userId", "getUserCredits", { balance: 1 }));
    g.route(route("post", "/api/credits/debit", "debitCredits", { ok: true }));

    const system: DocumentedRoute = { method: "get", path: "/api/health", name: "health", summary: "liveness", responses: [{ status: 200, description: "up" }] };
    const ops = contractDoc([system, g]);
    expect(ops.map((o) => o.name)).toEqual(["health", "getUserCredits", "debitCredits"]);
  });

  test("the group's ops reach the emitted v4 document, same as a hand-written array", () => {
    const g = routeGroup("/api/logs");
    g.route(route("get", "/api/logs", "listLogs", { logs: [] }));
    const { document } = emitV4(contractDoc([g]));
    expect(document.paths["api/logs"]).toBeDefined();
  });

  test("no groups → contractDoc preserves the exact input array (backward compatible)", () => {
    const arr: DocumentedRoute[] = [{ method: "get", path: "/api/health", name: "health", summary: "liveness" }];
    expect(contractDoc(arr)).toBe(arr);
  });
});
