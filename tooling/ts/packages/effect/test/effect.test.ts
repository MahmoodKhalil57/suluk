import { test, expect, describe } from "bun:test";
import { Effect } from "effect";
import { z } from "zod";
import { Hono } from "hono";
import { emitV4, responseList } from "@suluk/hono";
import { httpError, effectRoute, Created } from "../src/index";

const InsufficientCredits = httpError("InsufficientCredits", 402, z.object({ required: z.number(), balance: z.number() }));
const NotFound = httpError("NotFound", 404, z.object({ resource: z.string() }));

describe("httpError — a typed Effect error carrying status + schema", () => {
  test("statics + a failable TaggedError instance", () => {
    expect(InsufficientCredits.status).toBe(402);
    expect(InsufficientCredits.errorTag).toBe("InsufficientCredits");
    const e = new InsufficientCredits({ required: 10, balance: 3 });
    expect(e._tag).toBe("InsufficientCredits");
    expect(e.required).toBe(10);
    // it composes into an Effect error channel
    const program: Effect.Effect<never, InstanceType<typeof InsufficientCredits>> = Effect.fail(new InsufficientCredits({ required: 1, balance: 0 }));
    expect(Effect.runSyncExit(program)._tag).toBe("Failure");
  });
});

describe("effectRoute — the contract is DERIVED from the handler's success + error types", () => {
  const { contract } = effectRoute({
    method: "post", summary: "test route", path: "/credits/debit", name: "debitCredits",
    ok: { schema: z.object({ ok: z.literal(true) }) },
    errors: [InsufficientCredits, NotFound],
    run: () => Effect.succeed({ ok: true as const }),
  });
  const responses = responseList(contract.responses);
  test("success status is inferred from the method (POST → 201), not hardcoded 200", () => {
    expect(responses.some((r) => r.status === 201 && r.schema)).toBe(true);
    expect(responses.some((r) => r.status === 200)).toBe(false);
  });
  test("each declared error becomes a TYPED response (its own status + schema)", () => {
    expect(responses.find((r) => r.status === 402)?.schema).toBe(InsufficientCredits.bodySchema);
    expect(responses.find((r) => r.status === 404)?.schema).toBe(NotFound.bodySchema);
  });
  test("an explicit ok.status overrides the method default", () => {
    const { contract: c } = effectRoute({ method: "post", summary: "test route", path: "/x", ok: { status: 200, schema: z.object({}) }, run: () => Effect.succeed({}) });
    expect(responseList(c.responses).some((r) => r.status === 200)).toBe(true);
  });
});

describe("effectRoute — runtime: run the Effect, map success/failure/defect", () => {
  const mount = (run: () => Effect.Effect<{ ok: boolean }, InstanceType<typeof InsufficientCredits>>) => {
    const { handler } = effectRoute({ method: "post", summary: "test route", path: "/x", ok: { schema: z.object({ ok: z.boolean() }) }, errors: [InsufficientCredits], run });
    const app = new Hono();
    app.post("/x", handler);
    return app;
  };
  test("success → the derived status + body", async () => {
    const res = await mount(() => Effect.succeed({ ok: true })).request("/x", { method: "POST" });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
  });
  test("a TAGGED failure → its status + the DETAILED typed body (not ProblemDetails)", async () => {
    const res = await mount(() => Effect.fail(new InsufficientCredits({ required: 10, balance: 3 }))).request("/x", { method: "POST" });
    expect(res.status).toBe(402);
    expect(await res.json()).toEqual({ required: 10, balance: 3 }); // the actual error shape
  });
  test("a DEFECT (die) → 500 Problem Details, surfaced not swallowed", async () => {
    const res = await mount(() => Effect.die(new Error("boom"))).request("/x", { method: "POST" });
    expect(res.status).toBe(500);
    expect((await res.json()).status).toBe(500);
  });
  test("respond()/Created bubbles a per-request success status up from the handler", async () => {
    const { handler } = effectRoute({ method: "post", summary: "test route", path: "/y", ok: { status: 200, schema: z.object({ id: z.string() }) }, run: () => Effect.succeed(Created({ id: "abc" })) });
    const app = new Hono();
    app.post("/y", handler);
    const res = await app.request("/y", { method: "POST" });
    expect(res.status).toBe(201); // Created(...) overrode the declared 200
    expect(await res.json()).toEqual({ id: "abc" });
  });
});

describe("type-enforcement — the E channel is EXACT (you can't under-declare the ways it throws)", () => {
  test("failing with an error NOT in `errors` is a TYPE error", () => {
    // @ts-expect-error — run fails with NotFound but it isn't declared in `errors`; the mismatch MUST not compile. (If this
    // line ever compiles, the @ts-expect-error becomes unused and this file fails to typecheck — the guard is self-checking.)
    effectRoute({ method: "post", summary: "test route", path: "/z", ok: { schema: z.object({}) }, errors: [InsufficientCredits], run: () => Effect.fail(new NotFound({ resource: "x" })) });
    expect(true).toBe(true);
  });
});

describe("emitV4 — the typed errors reach the v4 document (not a generic ProblemDetails)", () => {
  test("the 402 carries the InsufficientCredits schema; the always-500 stays ProblemDetails", () => {
    const { contract } = effectRoute({
      method: "post", summary: "test route", path: "/api/credits/debit", name: "debitCredits", scopes: ["credits:write"],
      ok: { schema: z.object({ ok: z.literal(true) }) },
      errors: [InsufficientCredits],
      run: () => Effect.succeed({ ok: true as const }),
    });
    const { document } = emitV4([contract], { synthesizeErrors: true });
    const op = (document.paths["api/credits/debit"] as any).requests.debitCredits;
    // the 402 is a $ref to a NAMED component (so a renderer shows "InsufficientCredits", not "object") — not ProblemDetails.
    const r402 = JSON.stringify(op.responses["402"].contentSchema);
    expect(r402).toContain("InsufficientCredits");
    expect(r402).not.toContain("ProblemDetails");
    // the named component carries the ACTUAL error fields (generated from the httpError schema).
    expect(JSON.stringify((document.components as any).schemas.InsufficientCredits)).toContain("required");
    // the success + the synthesized generic errors (a handler can always die / be denied)
    expect(op.responses["201"]).toBeDefined();
    expect(JSON.stringify(op.responses["500"].contentSchema)).toContain("ProblemDetails");
    expect(JSON.stringify(op.responses["401"].contentSchema)).toContain("ProblemDetails"); // scoped → synthesized
  });
});
