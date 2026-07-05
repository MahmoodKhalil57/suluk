import { test, expect, describe } from "bun:test";
import { Effect } from "effect";
import { z } from "zod";
import type { Context } from "hono";
import { sulukFn, sulukFmt, ref, sulukRoute, lintRunGraph, view, NotFoundError, TimeoutError, type ActionCtx } from "../src/index";

/**
 * THE `x-suluk-run` PIPELINE GRAPH (C104/C105) — a BYPRODUCT of composing sulukFn/sulukFmt/sulukFmt.all, never a
 * hand-authored parallel spec. A leaf that declares no `node` contributes nothing; the whole facet is absent unless
 * an author opts in (zero impact on every route that doesn't). DECLARED-AND-ENFORCED (real runtime behavior):
 * `retry`/`timeoutMs`/`recover` (per node, real Effect.retry/timeoutFail/catchTags) and `compensate` (per pipeline,
 * a real reverse-order rollback on a LATER failure). DECLARED-ONLY (advisory, never executed): `idempotent`. The
 * graph itself is VALIDATED (acyclic + no dangling references) at every merge point — a malformed graph throws
 * eagerly rather than silently corrupting `terminals`/`resultNode`.
 */
const stubCtx: ActionCtx = { c: {} as unknown as Context, userId: "", param: () => undefined };

describe("x-suluk-run — zero impact when unused", () => {
  test("a pipeline with no `node` label anywhere emits no runGraph at all", () => {
    const findItem = sulukFn({ ok: { schema: z.object({ id: z.string() }) }, run: () => Effect.succeed({ id: "a" }) });
    const route = sulukFmt(
      sulukFn({ method: "get", path: "/api/items/:id", roles: ["signed-in"], summary: "Get.", view: view("item"), run: (ctx) => Effect.succeed(ctx.param("id")!) }),
      sulukFmt(findItem),
    );
    expect(route.slice.runGraph).toBeUndefined();
    const { contract } = sulukRoute(route, { provide: (_env, p) => p as never });
    expect((contract as { runGraph?: unknown }).runGraph).toBeUndefined();
  });
});

describe("x-suluk-run — linear wiring (sulukFmt)", () => {
  test("two labeled nodes in a linear pipeline get ONE sequential edge, terminals computed correctly", () => {
    const fetchCart = sulukFn({ node: { label: "cart.fetch", kind: "internal" }, run: () => Effect.succeed({ total: 10 }) });
    const charge = sulukFn({ node: { label: "payments.charge", kind: "external", from: "stripe" }, run: (ctx, cart: { total: number }) => Effect.succeed({ ok: true, total: cart.total }) });
    const checkout = sulukFmt(fetchCart, charge);
    const g = checkout.slice.runGraph!;
    expect(g.nodes.map((n) => n.label).sort()).toEqual(["cart.fetch", "payments.charge"]);
    expect(g.edges).toEqual([{ to: "payments.charge", after: ["cart.fetch"] }]);
    expect(g.terminals).toEqual(["payments.charge"]);
  });

  test("a THREE-stage linear pipeline wires each stage after the previous one's terminal", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: (ctx, n: number) => Effect.succeed(n + 1) });
    const c = sulukFn({ node: { label: "c", kind: "internal" }, run: (ctx, n: number) => Effect.succeed(n + 1) });
    const g = sulukFmt(a, b, c).slice.runGraph!;
    expect(g.edges.sort((x, y) => x.to.localeCompare(y.to))).toEqual([
      { to: "b", after: ["a"] },
      { to: "c", after: ["b"] },
    ]);
    expect(g.terminals).toEqual(["c"]);
  });

  test("an UNLABELED fn passed through sulukFmt just passes the labeled side's graph through unchanged", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const plain = sulukFn({ run: (ctx, n: number) => Effect.succeed(n + 1) });
    const g = sulukFmt(a, plain).slice.runGraph!;
    expect(g.nodes.map((n) => n.label)).toEqual(["a"]);
    expect(g.edges).toEqual([]);
    expect(g.terminals).toEqual(["a"]);
  });
});

describe("x-suluk-run — fan-out (sulukFmt.all)", () => {
  test("branches run on the SAME input — no dependency edge between them, both are roots AND terminals", () => {
    const item = sulukFn({ node: { label: "item.get", kind: "internal" }, ok: { schema: z.object({ id: z.string() }) }, run: () => Effect.succeed({ id: "a" }) });
    const count = sulukFn({ node: { label: "count.get", kind: "internal" }, ok: { schema: z.number() }, run: () => Effect.succeed(3) });
    const fan = sulukFmt.all({ item, count });
    const g = fan.slice.runGraph!;
    expect(g.edges).toEqual([]);
    expect(g.terminals.sort()).toEqual(["count.get", "item.get"]);
  });

  test("a fan-out NESTED after a linear stage wires an edge into EACH of the fan-out's entry nodes", () => {
    const auth = sulukFn({ node: { label: "auth.check", kind: "internal" }, run: () => Effect.succeed("u-1") });
    const item = sulukFn({ node: { label: "item.get", kind: "internal" }, run: () => Effect.succeed({ id: "a" }) });
    const count = sulukFn({ node: { label: "count.get", kind: "internal" }, run: () => Effect.succeed(3) });
    const fan = sulukFmt.all({ item, count });
    const g = sulukFmt(auth, fan).slice.runGraph!;
    expect(g.edges.sort((x, y) => x.to.localeCompare(y.to))).toEqual([
      { to: "count.get", after: ["auth.check"] },
      { to: "item.get", after: ["auth.check"] },
    ]);
    expect(g.terminals.sort()).toEqual(["count.get", "item.get"]);
  });

  test("a fan-out consumed as `prev` by a LATER sulukFmt stage produces a TRUE multi-parent JOIN edge, and the runtime genuinely waits for every branch", async () => {
    const order: string[] = [];
    const item = sulukFn({ node: { label: "item", kind: "internal" }, run: () => Effect.sync(() => { order.push("item"); return "i"; }) });
    const count = sulukFn({ node: { label: "count", kind: "internal" }, run: () => Effect.sync(() => { order.push("count"); return 1; }) });
    const fan = sulukFmt.all({ item, count });
    const summarize = sulukFn({ node: { label: "summarize", kind: "internal" }, run: (ctx, x: unknown) => Effect.sync(() => { order.push("summarize"); return JSON.stringify(x); }) });
    const pipeline = sulukFmt(fan, summarize);
    const g = pipeline.slice.runGraph!;
    const joinEdge = g.edges.find((e) => e.to === "summarize")!;
    expect(joinEdge.after.sort()).toEqual(["count", "item"]); // depends on BOTH — not a single dependency
    const result = await Effect.runPromise(pipeline.run(stubCtx, undefined));
    expect(result).toBe(JSON.stringify({ item: "i", count: 1 }));
    expect(order.indexOf("summarize")).toBeGreaterThan(order.indexOf("item"));
    expect(order.indexOf("summarize")).toBeGreaterThan(order.indexOf("count")); // summarize really waited for BOTH
  });
});

describe("x-suluk-run — ref() placeholder ops", () => {
  test("composes exactly like a real sulukFn (same graph shape), stamped stub:true", () => {
    const fetchCart = sulukFn({ node: { label: "cart.fetch", kind: "internal" }, run: () => Effect.succeed({ total: 10 }) });
    const charge = ref<{ total: number }, { ok: true }>("payments.charge", { kind: "external", from: "stripe" });
    const checkout = sulukFmt(fetchCart, charge);
    const g = checkout.slice.runGraph!;
    expect(g.nodes.find((n) => n.label === "payments.charge")).toMatchObject({ kind: "external", from: "stripe", stub: true });
    expect(g.edges).toEqual([{ to: "payments.charge", after: ["cart.fetch"] }]);
  });

  test("calling a ref() with no real `run` supplied dies (design-time only, not meant to serve traffic)", async () => {
    const charge = ref("payments.charge", { kind: "external" });
    await expect(Effect.runPromise(charge.run(stubCtx, undefined))).rejects.toThrow();
  });

  test("once a real `run` is supplied, it behaves like an ordinary sulukFn (not stubbed)", async () => {
    const charge = ref<number, number>("double", { kind: "generic", run: (ctx, n) => Effect.succeed(n * 2) });
    expect(charge.slice.runGraph!.nodes[0]!.stub).toBeUndefined();
    expect(await Effect.runPromise(charge.run(stubCtx, 21))).toBe(42);
  });
});

describe("x-suluk-run — per-node input/output contracts (zodToV4)", () => {
  test("a sulukFn's `body`/`ok.schema` become the node's input/output, as JSON Schema", () => {
    const Body = z.object({ title: z.string() });
    const Out = z.object({ id: z.string(), title: z.string() });
    const createItem = sulukFn({ node: { label: "item.create", kind: "internal" }, body: Body, ok: { schema: Out }, run: (ctx, b: { title: string }) => Effect.succeed({ id: "1", ...b }) });
    const node = createItem.slice.runGraph!.nodes[0]!;
    expect(node.input).toMatchObject({ type: "object", properties: { title: { type: "string" } } });
    expect(node.output).toMatchObject({ type: "object", properties: { id: { type: "string" }, title: { type: "string" } } });
  });

  test("ref()'s input/output schemas convert the same way", () => {
    const charge = ref("payments.charge", { kind: "external", input: z.object({ amount: z.number() }), output: z.object({ ok: z.boolean() }) });
    const node = charge.slice.runGraph!.nodes[0]!;
    expect(node.input).toMatchObject({ type: "object", properties: { amount: { type: "number" } } });
    expect(node.output).toMatchObject({ type: "object", properties: { ok: { type: "boolean" } } });
  });

  test("a node with no body/ok.schema (or ref with no input/output) declares neither field", () => {
    const bare = sulukFn({ node: { label: "bare", kind: "internal" }, run: () => Effect.succeed(1) });
    const node = bare.slice.runGraph!.nodes[0]!;
    expect(node.input).toBeUndefined();
    expect(node.output).toBeUndefined();
  });
});

describe("x-suluk-run — retry is DECLARED-AND-ENFORCED (a real Effect.retry, not just data)", () => {
  test("a node declaring retry:{times} ACTUALLY retries a failing run until it succeeds", async () => {
    let attempts = 0;
    const flaky = sulukFn({
      node: { label: "flaky.op", kind: "internal", retry: { times: 2 } },
      errors: [NotFoundError],
      run: () => Effect.gen(function* () {
        attempts++;
        if (attempts < 3) return yield* new NotFoundError({ resource: "x" });
        return "ok" as const;
      }),
    });
    const result = await Effect.runPromise(flaky.run(stubCtx, undefined));
    expect(result).toBe("ok");
    expect(attempts).toBe(3); // 1 initial + 2 retries
  });

  test("retry is BOUNDED — exhausting the declared attempts still propagates the failure", async () => {
    let attempts = 0;
    const alwaysFails = sulukFn({
      node: { label: "always.fails", kind: "internal", retry: { times: 2 } },
      errors: [NotFoundError],
      run: () => Effect.gen(function* () { attempts++; return yield* new NotFoundError({ resource: "x" }); }),
    });
    await expect(Effect.runPromise(alwaysFails.run(stubCtx, undefined))).rejects.toThrow();
    expect(attempts).toBe(3); // 1 initial + 2 retries, then gives up
  });

  test("a node with NO retry declared runs exactly once on failure (unchanged, pre-C104 behavior)", async () => {
    let attempts = 0;
    const plain = sulukFn({ errors: [NotFoundError], run: () => Effect.gen(function* () { attempts++; return yield* new NotFoundError({ resource: "x" }); }) });
    await expect(Effect.runPromise(plain.run(stubCtx, undefined))).rejects.toThrow();
    expect(attempts).toBe(1);
  });

  test("retry.delayMs is accepted and still eventually succeeds (spaced schedule)", async () => {
    let attempts = 0;
    const flaky = sulukFn({
      node: { label: "flaky.spaced", kind: "internal", retry: { times: 1, delayMs: 1 } },
      errors: [NotFoundError],
      run: () => Effect.gen(function* () { attempts++; if (attempts < 2) return yield* new NotFoundError({ resource: "x" }); return "ok"; }),
    });
    expect(await Effect.runPromise(flaky.run(stubCtx, undefined))).toBe("ok");
    expect(attempts).toBe(2);
  });
});

describe("x-suluk-run — timeout is DECLARED-AND-ENFORCED (a real Effect.timeoutFail → typed 504)", () => {
  test("a run exceeding its declared timeoutMs fails with a typed TimeoutError, not a hang", async () => {
    const slow = sulukFn({
      node: { label: "slow.op", kind: "internal", timeoutMs: 10 },
      run: () => Effect.gen(function* () { yield* Effect.sleep("200 millis"); return "done"; }),
    });
    // the timeout error is added to the node's + the fn's declared errors, so the doc surfaces a 504.
    expect(slow.slice.errors?.map((e) => e.errorTag)).toContain("TimeoutError");
    expect(slow.slice.runGraph!.nodes[0]!.timeoutMs).toBe(10);
    const failure = await Effect.runPromiseExit(slow.run(stubCtx, undefined));
    expect(failure._tag).toBe("Failure");
    if (failure._tag === "Failure") {
      const err = (failure.cause as { error?: { _tag?: string; timeoutMs?: number } }).error;
      expect(err?._tag).toBe("TimeoutError");
      expect(err?.timeoutMs).toBe(10);
    }
  });

  test("a run finishing WELL within timeoutMs is unaffected", async () => {
    const fast = sulukFn({ node: { label: "fast.op", kind: "internal", timeoutMs: 5000 }, run: () => Effect.succeed(42) });
    expect(await Effect.runPromise(fast.run(stubCtx, undefined))).toBe(42);
  });

  test("ref()'s timeoutMs enforces the same way", async () => {
    const slow = ref("slow.external", {
      kind: "external", timeoutMs: 10,
      run: () => Effect.gen(function* () { yield* Effect.sleep("200 millis"); return "done"; }),
    });
    const failure = await Effect.runPromiseExit(slow.run(stubCtx, undefined));
    expect(failure._tag).toBe("Failure");
  });

  test("TimeoutError carries the node's own label, not a generic one", async () => {
    const slow = sulukFn({ node: { label: "payments.charge", kind: "external", timeoutMs: 5 }, run: () => Effect.sleep("100 millis") });
    const failure = await Effect.runPromiseExit(slow.run(stubCtx, undefined));
    if (failure._tag === "Failure") {
      const err = (failure.cause as { error?: { label?: string } }).error;
      expect(err?.label).toBe("payments.charge");
    }
  });
});

describe("x-suluk-run — idempotent is DECLARED-ONLY (advisory, never enforced)", () => {
  test("idempotent:true changes NOTHING about how many times the run executes without an explicit retry", async () => {
    let attempts = 0;
    const op = sulukFn({ node: { label: "op", kind: "internal", idempotent: true }, run: () => Effect.sync(() => ++attempts) });
    await Effect.runPromise(op.run(stubCtx, undefined));
    expect(attempts).toBe(1); // no dedup/retry machinery reads this — it's pure metadata
    expect(op.slice.runGraph!.nodes[0]!.idempotent).toBe(true);
  });

  test("a PLAIN pipeline (no recover/compensate) never authors an \"error\" edge — `on` stays undefined ⇒ \"success\"", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: (ctx, n: number) => Effect.succeed(n + 1) });
    const g = sulukFmt(a, b).slice.runGraph!;
    expect(g.edges.every((e) => e.on === undefined)).toBe(true);
  });
});

type NFI = InstanceType<typeof NotFoundError>;

describe("x-suluk-run — recover is DECLARED-AND-ENFORCED (C105): a real Effect.catchTags fallback, type-scoped to this node's own errors", () => {
  test("a node's own declared error routes to its typed fallback fn, which produces the result instead", async () => {
    const fallback = sulukFn({ node: { label: "charge.fallback", kind: "internal" }, run: (): Effect.Effect<string, never, never> => Effect.succeed("fallback-ok") });
    const primary = sulukFn({
      node: { label: "charge.primary", kind: "external", recover: { NotFoundError: fallback } },
      errors: [NotFoundError],
      run: (): Effect.Effect<string, NFI, never> => Effect.fail(new NotFoundError({ resource: "account" })),
    });
    expect(await Effect.runPromise(primary.run(stubCtx, undefined))).toBe("fallback-ok");
  });

  test("recover only fires once `retry` is EXHAUSTED — a transient failure that eventually succeeds never touches the fallback", async () => {
    let primaryAttempts = 0;
    let fallbackRan = false;
    const fallback = sulukFn({ node: { label: "f", kind: "internal" }, run: (): Effect.Effect<string, never, never> => Effect.sync(() => { fallbackRan = true; return "fallback"; }) });
    const primary = sulukFn({
      node: { label: "p", kind: "internal", retry: { times: 2 }, recover: { NotFoundError: fallback } },
      errors: [NotFoundError],
      run: (): Effect.Effect<string, NFI, never> => Effect.gen(function* () {
        primaryAttempts++;
        if (primaryAttempts < 3) return yield* new NotFoundError({ resource: "x" });
        return "primary-ok";
      }),
    });
    expect(await Effect.runPromise(primary.run(stubCtx, undefined))).toBe("primary-ok");
    expect(primaryAttempts).toBe(3);
    expect(fallbackRan).toBe(false);
  });

  test("recover graph: a fallback WITH its own node label gets a TAGGED \"error\" edge — the error-path never affects the success-path shape", () => {
    const fallback = sulukFn({ node: { label: "charge.fallback", kind: "internal" }, run: (): Effect.Effect<string, never, never> => Effect.succeed("ok") });
    const primary = sulukFn({
      node: { label: "charge.primary", kind: "external", recover: { NotFoundError: fallback } },
      errors: [NotFoundError],
      run: (): Effect.Effect<string, NFI, never> => Effect.fail(new NotFoundError({ resource: "account" })),
    });
    const g = primary.slice.runGraph!;
    expect(g.nodes.map((n) => n.label).sort()).toEqual(["charge.fallback", "charge.primary"]);
    expect(g.edges).toEqual([{ to: "charge.fallback", after: ["charge.primary"], on: "error", errorTag: "NotFoundError" }]);
    expect(g.terminals).toEqual(["charge.primary"]); // the error edge doesn't strip primary's terminal status
    expect(g.resultNode).toBe("charge.primary");
  });

  test("a fallback with NO node label of its own contributes no edge, but still runs for real", async () => {
    const fallback = sulukFn({ run: (): Effect.Effect<string, never, never> => Effect.succeed("bare-fallback") }); // unlabeled
    const primary = sulukFn({
      node: { label: "p", kind: "internal", recover: { NotFoundError: fallback } },
      errors: [NotFoundError],
      run: (): Effect.Effect<string, NFI, never> => Effect.fail(new NotFoundError({ resource: "x" })),
    });
    expect(primary.slice.runGraph!.edges).toEqual([]);
    expect(await Effect.runPromise(primary.run(stubCtx, undefined))).toBe("bare-fallback");
  });

  test("ref()'s recover works the same way, type-scoped to its own declared errors", async () => {
    const fallback = ref<number, string>("f", { kind: "generic", run: () => Effect.succeed("recovered") });
    const primary = ref<number, string, readonly [typeof NotFoundError]>("p", {
      kind: "external",
      errors: [NotFoundError] as const,
      recover: { NotFoundError: fallback },
      run: (): Effect.Effect<string, NFI, never> => Effect.fail(new NotFoundError({ resource: "x" })),
    });
    expect(await Effect.runPromise(primary.run(stubCtx, 1))).toBe("recovered");
  });
});

describe("x-suluk-run — compensate is DECLARED-AND-ENFORCED (C105): automatic rollback of already-succeeded steps on a LATER failure", () => {
  test("sulukFmt compensates already-succeeded steps in REVERSE order when a later step fails", async () => {
    const order: string[] = [];
    const compA = sulukFn({ run: (ctx, input: string) => Effect.sync(() => { order.push(`compA(${input})`); }) });
    const compB = sulukFn({ run: (ctx, input: number) => Effect.sync(() => { order.push(`compB(${input})`); }) });
    const a = sulukFn({ node: { label: "a", kind: "internal", compensate: compA }, run: (ctx, input: string) => Effect.sync(() => { order.push("a"); return input.length; }) });
    const b = sulukFn({ node: { label: "b", kind: "internal", compensate: compB }, run: (ctx, n: number) => Effect.sync(() => { order.push("b"); return n + 1; }) });
    const c = sulukFn({ node: { label: "c", kind: "internal" }, errors: [NotFoundError], run: () => Effect.fail(new NotFoundError({ resource: "x" })) });
    await expect(Effect.runPromise(sulukFmt(a, b, c).run(stubCtx, "hi"))).rejects.toThrow();
    // compensate is invoked with the ORIGINAL INPUT each step received: b received a's output (2, "hi".length),
    // not b's own output (3) — b's compensate runs BEFORE a's (reverse order).
    expect(order).toEqual(["a", "b", "compB(2)", "compA(hi)"]);
  });

  test("a LATER step that DIES (a raw throw, not a typed httpError failure) still triggers compensation of already-succeeded steps", async () => {
    let refunded = false;
    const refund = sulukFn({ run: () => Effect.sync(() => { refunded = true; }) });
    const chargeCard = sulukFn({ node: { label: "charge", kind: "external", compensate: refund }, run: () => Effect.succeed("charged") });
    const sendReceipt = sulukFn({ node: { label: "receipt", kind: "internal" }, run: (): Effect.Effect<never> => Effect.sync(() => { throw new Error("unexpected crash, not a declared httpError"); }) });
    const exit = await Effect.runPromiseExit(sulukFmt(chargeCard, sendReceipt).run(stubCtx, undefined));
    expect(exit._tag).toBe("Failure");
    if (exit._tag === "Failure") expect(exit.cause._tag).toBe("Die"); // confirms this really is a DEFECT, not a typed Fail
    expect(refunded).toBe(true); // the compensator STILL ran — this is the whole point of C105
  });

  test("a step's OWN failure does NOT trigger its own compensate — it never succeeded", async () => {
    let compRan = false;
    const comp = sulukFn({ run: () => Effect.sync(() => { compRan = true; }) });
    const a = sulukFn({ node: { label: "a", kind: "internal", compensate: comp }, errors: [NotFoundError], run: () => Effect.fail(new NotFoundError({ resource: "x" })) });
    await expect(Effect.runPromise(sulukFmt(a).run(stubCtx, undefined))).rejects.toThrow();
    expect(compRan).toBe(false);
  });

  test("a compensator's OWN failure is swallowed — best-effort, never masks the REAL failure", async () => {
    const comp = sulukFn({ errors: [NotFoundError], run: () => Effect.fail(new NotFoundError({ resource: "comp-failed" })) });
    const a = sulukFn({ node: { label: "a", kind: "internal", compensate: comp }, run: () => Effect.succeed("ok") });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, errors: [NotFoundError], run: () => Effect.fail(new NotFoundError({ resource: "real-failure" })) });
    const failure = await Effect.runPromiseExit(sulukFmt(a, b).run(stubCtx, undefined));
    expect(failure._tag).toBe("Failure");
    if (failure._tag === "Failure") {
      const err = (failure.cause as { error?: { resource?: string } }).error;
      expect(err?.resource).toBe("real-failure"); // NOT "comp-failed"
    }
  });

  test("a pipeline where NOTHING declares compensate runs the plain loop, unaffected (zero-overhead path)", async () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: (ctx, n: number) => Effect.succeed(n + 1) });
    expect(await Effect.runPromise(sulukFmt(a, b).run(stubCtx, undefined))).toBe(2);
  });

  test("compensate graph: the guarding node's `compensate` names the compensator's own label, wired via an UNTAGGED error edge", () => {
    const comp = sulukFn({ node: { label: "payments.refund", kind: "internal" }, run: () => Effect.succeed("refunded") });
    const charge = sulukFn({ node: { label: "payments.charge", kind: "external", compensate: comp }, run: () => Effect.succeed("charged") });
    const g = charge.slice.runGraph!;
    expect(g.nodes.find((n) => n.label === "payments.charge")?.compensate).toBe("payments.refund");
    expect(g.edges).toEqual([{ to: "payments.refund", after: ["payments.charge"], on: "error" }]);
  });

  test("sulukFmt.all compensates only the branches that actually SUCCEEDED when the fan-out as a whole fails", async () => {
    const ran: string[] = [];
    const compItem = sulukFn({ run: () => Effect.sync(() => { ran.push("compItem"); }) });
    const item = sulukFn({ node: { label: "item", kind: "internal", compensate: compItem }, run: () => Effect.sync(() => { ran.push("item"); return "i"; }) });
    const count = sulukFn({
      node: { label: "count", kind: "internal" }, errors: [NotFoundError],
      run: () => Effect.sync(() => ran.push("count")).pipe(Effect.flatMap(() => Effect.fail(new NotFoundError({ resource: "x" })))),
    });
    const fan = sulukFmt.all({ item, count });
    await expect(Effect.runPromise(fan.run(stubCtx, undefined))).rejects.toThrow();
    expect(ran).toContain("item");
    expect(ran).toContain("compItem"); // item succeeded before count failed, so it gets compensated
  });

  test("sulukFmt.all compensates a succeeded branch even when the OTHER branch DIES (a raw throw), not just a typed failure", async () => {
    let refunded = false;
    const compItem = sulukFn({ run: () => Effect.sync(() => { refunded = true; }) });
    const item = sulukFn({ node: { label: "item", kind: "internal", compensate: compItem }, run: () => Effect.succeed("i") });
    const crashing = sulukFn({ node: { label: "crashing", kind: "internal" }, run: (): Effect.Effect<never> => Effect.sync(() => { throw new Error("boom"); }) });
    const fan = sulukFmt.all({ item, crashing });
    const exit = await Effect.runPromiseExit(fan.run(stubCtx, undefined));
    expect(exit._tag).toBe("Failure");
    if (exit._tag === "Failure") expect(exit.cause._tag === "Die" || exit.cause._tag === "Parallel").toBe(true);
    expect(refunded).toBe(true);
  });
});

describe("x-suluk-run — resultNode (C105): the single node whose output IS the graph's result", () => {
  test("a linear pipeline's resultNode is its sole terminal", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: (ctx, n: number) => Effect.succeed(n + 1) });
    expect(sulukFmt(a, b).slice.runGraph!.resultNode).toBe("b");
  });

  test("an un-followed fan-out has NO resultNode — multiple terminals combine into a derived composite, not one node's output", () => {
    const item = sulukFn({ node: { label: "item", kind: "internal" }, run: () => Effect.succeed("i") });
    const count = sulukFn({ node: { label: "count", kind: "internal" }, run: () => Effect.succeed(1) });
    const g = sulukFmt.all({ item, count }).slice.runGraph!;
    expect(g.terminals.length).toBe(2);
    expect(g.resultNode).toBeUndefined();
  });

  test("a fan-out FOLLOWED by a further linear stage has a resultNode again (that later stage is the sole terminal)", () => {
    const item = sulukFn({ node: { label: "item", kind: "internal" }, run: () => Effect.succeed("i") });
    const count = sulukFn({ node: { label: "count", kind: "internal" }, run: () => Effect.succeed(1) });
    const fan = sulukFmt.all({ item, count });
    const summarize = sulukFn({ node: { label: "summarize", kind: "internal" }, run: (ctx, x: unknown) => Effect.succeed(JSON.stringify(x)) });
    expect(sulukFmt(fan, summarize).slice.runGraph!.resultNode).toBe("summarize");
  });
});

describe("x-suluk-run — lintRunGraph (C105): VALIDATED (acyclic + no dangling references) at every merge point", () => {
  test("reusing an already-composed node in an inconsistent order creates a REAL cycle — rejected eagerly, not silently", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const otherFn = sulukFn({ node: { label: "otherFn", kind: "internal" }, run: (ctx, n: number) => Effect.succeed(n + 1) });
    const b = sulukFmt(a, otherFn); // wires otherFn after a
    expect(() => sulukFmt(b, a)).toThrow(/cycle detected/);
  });

  test("a well-formed graph (no reuse) never throws", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: (ctx, n: number) => Effect.succeed(n + 1) });
    expect(() => sulukFmt(a, b)).not.toThrow();
  });

  test("lintRunGraph is exported for standalone validation of an already-built graph", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const g = a.slice.runGraph!;
    expect(() => lintRunGraph(g)).not.toThrow();
    expect(() => lintRunGraph({ nodes: g.nodes, edges: [{ to: "a", after: ["nonexistent"] }] })).toThrow(/unknown node/);
    expect(() => lintRunGraph({ nodes: g.nodes, edges: [{ to: "nonexistent", after: ["a"] }] })).toThrow(/unknown node/);
  });
});

describe("x-suluk-run — sulukRoute propagates the merged graph onto the contract", () => {
  test("a route built from a labeled pipeline stamps `runGraph` on the derived contract", () => {
    const fetchCart = sulukFn({ node: { label: "cart.fetch", kind: "internal" }, run: () => Effect.succeed({ total: 10 }) });
    const charge = sulukFn({ node: { label: "payments.charge", kind: "external" }, run: (ctx, cart: { total: number }) => Effect.succeed({ ok: true, total: cart.total }) });
    const route = sulukFmt(
      sulukFn({ method: "post", path: "/api/checkout", roles: ["signed-in"], summary: "Checkout.", ok: { schema: z.object({ ok: z.boolean(), total: z.number() }) }, run: (ctx) => Effect.succeed(undefined) }),
      sulukFmt(fetchCart, charge),
    );
    const { contract } = sulukRoute(route, { provide: (_env, p) => p as never });
    const runGraph = (contract as { runGraph?: { nodes: { label: string }[]; edges: unknown[]; terminals: string[] } }).runGraph;
    expect(runGraph).toBeDefined();
    expect(runGraph!.nodes.map((n) => n.label).sort()).toEqual(["cart.fetch", "payments.charge"]);
    expect(runGraph!.terminals).toEqual(["payments.charge"]);
  });
});
