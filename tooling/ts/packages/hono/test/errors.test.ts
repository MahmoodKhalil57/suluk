import { test, expect, describe } from "bun:test";
import { Hono } from "hono";
import { HttpErrors } from "../src/errors";
import { onError as onErrorHandler } from "../src/on-error";
import { emitV4 } from "../src/emit";
import { isProblemDetails } from "@suluk/core";

describe("@suluk/hono error model — typed throws → RFC-9457 (ported from saastarter route-handler.ts)", () => {
  test("each factory maps to its saastarter status", () => {
    expect(HttpErrors.unauthorized().status).toBe(401);
    expect(HttpErrors.forbidden().status).toBe(403);
    expect(HttpErrors.invalidApiKey("bad").status).toBe(401);
    expect(HttpErrors.validation("nope").status).toBe(400);
    expect(HttpErrors.notFound("Pet", "7").status).toBe(404);
    expect(HttpErrors.conflict("dup").status).toBe(409);
    expect(HttpErrors.payment("declined").status).toBe(402);
    expect(HttpErrors.invalidDiscount("SAVE", "expired").status).toBe(400);
    expect(HttpErrors.externalService("stripe", "charge").status).toBe(502);
    expect(HttpErrors.rateLimited(60_000).status).toBe(429);
    expect(HttpErrors.internal().status).toBe(500);
  });

  test("toProblem renders a valid Problem Details body with ported field semantics", () => {
    const nf = HttpErrors.notFound("Pet", "7").toProblem();
    expect(isProblemDetails(nf)).toBe(true);
    expect(nf).toMatchObject({ status: 404, title: "Not found", detail: "Pet not found", instance: "Pet/7" });

    const val = HttpErrors.validation("bad body", { name: "required" }).toProblem();
    expect(val).toMatchObject({ status: 400, detail: "bad body", errors: { name: "required" } });
  });

  test("externalService/internal keep the wire detail GENERIC and stash the cause for server logs only", () => {
    const ext = HttpErrors.externalService("stripe", "charge", new Error("boom"));
    expect(ext.toProblem().detail).toBeUndefined();            // not leaked
    expect(ext.toProblem().title).toBe("External service unavailable");
    expect(ext.logContext).toMatchObject({ service: "stripe", operation: "charge" });
  });

  test("retryAfterSeconds is ceil(retryAfterMs/1000), only for RateLimitedError", () => {
    expect(HttpErrors.rateLimited(60_000).retryAfterSeconds).toBe(60);
    expect(HttpErrors.rateLimited(1500).retryAfterSeconds).toBe(2);
    expect(HttpErrors.notFound("X").retryAfterSeconds).toBeUndefined();
  });
});

describe("onError handler — bridges a thrown typed error to the wire", () => {
  function appThrowing(err: unknown) {
    const logs: unknown[] = [];
    const app = new Hono();
    app.onError(onErrorHandler({ log: (m, ctx) => logs.push([m, ctx]) }));
    app.get("/boom", () => { throw err; });
    return { app, logs };
  }

  test("a SulukHttpError → its status + application/problem+json body", async () => {
    const { app } = appThrowing(HttpErrors.forbidden("nope"));
    const r = await app.request("/boom");
    expect(r.status).toBe(403);
    expect(r.headers.get("content-type")).toContain("application/problem+json");
    const body = await r.json();
    expect(body).toMatchObject({ status: 403, title: "Forbidden", detail: "nope" });
  });

  test("a 429 carries a Retry-After header (seconds)", async () => {
    const { app } = appThrowing(HttpErrors.rateLimited(60_000));
    const r = await app.request("/boom");
    expect(r.status).toBe(429);
    expect(r.headers.get("retry-after")).toBe("60");
  });

  test("an untyped throw is a defect → 500, cause logged, never leaked", async () => {
    const { app, logs } = appThrowing(new Error("secret stack detail"));
    const r = await app.request("/boom");
    expect(r.status).toBe(500);
    const body = await r.json();
    expect(body.title).toBe("Internal server error");
    expect(JSON.stringify(body)).not.toContain("secret stack detail");
    expect(logs.length).toBe(1); // logged server-side
  });
});

describe("emitV4 — synthesizes RFC-9457 error responses as PRECISE per-status problem stubs", () => {
  test("an auth-gated op gets 401/403/500, each $ref'ing its per-status component with const status/title/type", () => {
    const { document } = emitV4([
      { method: "get", path: "/admin/report", name: "getReport", scopes: ["admin"] },
    ], { securityScheme: "bearerAuth" });
    const resps = document.paths["admin/report"].requests.getReport.responses;
    expect(Object.keys(resps).sort()).toEqual(["200", "401", "403", "500"]);
    expect(resps["401"].contentType).toBe("application/problem+json");
    // per-status component (NOT a shared generic ProblemDetails)
    expect(resps["401"].contentSchema).toEqual({ $ref: "#/components/schemas/Unauthorized" });
    expect(resps["403"].contentSchema).toEqual({ $ref: "#/components/schemas/Forbidden" });
    expect(resps["500"].contentSchema).toEqual({ $ref: "#/components/schemas/InternalServerError" });
    const unauth = document.components?.schemas?.Unauthorized as { properties: Record<string, { const?: unknown }> };
    expect(unauth).toBeDefined();
    // the fixed members are LITERALS (const), not loose types; the deprecated `error` field is gone
    expect(unauth.properties.status.const).toBe(401);
    expect(unauth.properties.title.const).toBe("Unauthorized");
    expect(unauth.properties.type.const).toBe("https://suluk.dev/problems/unauthorized");
    expect("error" in unauth.properties).toBe(false);
    // the generic base is NOT emitted when every synthesized status is a known one
    expect(document.components?.schemas?.ProblemDetails).toBeUndefined();
  });

  test("a public op gets only the always-500 error (no 401/403 without auth)", () => {
    const { document } = emitV4([{ method: "get", path: "/health", name: "health" }]);
    expect(Object.keys(document.paths.health.requests.health.responses).sort()).toEqual(["200", "500"]);
  });

  test("explicit route.errors + rateLimit synthesize 404 + 429; a user-declared response is never clobbered", () => {
    const { document } = emitV4([
      {
        method: "post", path: "/orders", name: "createOrder",
        errors: [404],
        rateLimit: { windowMs: 60_000, maxRequests: 20, key: "ip" },
        responses: [{ status: 201, description: "created" }],
      },
    ]);
    const resps = document.paths.orders.requests.createOrder.responses;
    expect(Object.keys(resps).sort()).toEqual(["201", "404", "429", "500"]);
    expect(resps["201"].description).toBe("created"); // user's response preserved
    expect(document.paths.orders.requests.createOrder["x-suluk-ratelimit"]).toMatchObject({ maxRequests: 20 });
  });

  test("route.dedupe (C110) synthesizes 409 + stamps x-suluk-dedupe", () => {
    const { document } = emitV4([
      {
        method: "post", path: "/charges", name: "createCharge",
        dedupe: { ttlMs: 60_000, keySource: { header: "idempotency-key" } },
        responses: [{ status: 201, description: "created" }],
      },
    ]);
    const resps = document.paths.charges.requests.createCharge.responses;
    expect(Object.keys(resps).sort()).toEqual(["201", "409", "500"]);
    expect(resps["409"].contentSchema).toEqual({ $ref: "#/components/schemas/Conflict" });
    expect(document.paths.charges.requests.createCharge["x-suluk-dedupe"]).toMatchObject({ ttlMs: 60_000 });
  });

  test("an UNRECOGNIZED error status falls back to the generic ProblemDetails base", () => {
    const { document } = emitV4([
      { method: "get", path: "/teapot", name: "brew", errors: [418] },
    ]);
    const resps = document.paths.teapot.requests.brew.responses;
    expect(resps["418"].contentSchema).toEqual({ $ref: "#/components/schemas/ProblemDetails" });
    expect(document.components?.schemas?.ProblemDetails).toBeDefined();       // the generic base for the unknown status
    expect(document.components?.schemas?.InternalServerError).toBeDefined();  // 500 is always synthesized → per-status
  });

  test("synthesizeErrors:false yields a success-only projection (no error responses, no problem schema)", () => {
    const { document } = emitV4([
      { method: "get", path: "/admin/report", name: "getReport", scopes: ["admin"] },
    ], { synthesizeErrors: false });
    expect(Object.keys(document.paths["admin/report"].requests.getReport.responses)).toEqual(["200"]);
    expect(document.components?.schemas?.ProblemDetails).toBeUndefined();
  });
});
