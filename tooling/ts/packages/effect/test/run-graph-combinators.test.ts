import { test, expect, describe } from "bun:test";
import { Effect } from "effect";
import { z } from "zod";
import type { Context } from "hono";
import { sulukFn, sulukFmt, sulukRoute, lintRunGraph, view, NotFoundError, type ActionCtx } from "../src/index";

/**
 * FIRST-CLASS branch / join-policy / aggregation / graph-I/O (C106) — extends C104/C105's `x-suluk-run` primitive.
 * `sulukFmt.branch` is real, type-checked conditional routing over a node's OWN declared cases (never a general
 * cross-graph branch executor); `sulukFmt.race`/`sulukFmt.quorum` are real concurrent join policies (Effect has no
 * built-in for either — hand-built via Deferred+Fiber, adversarially reviewed for fiber leaks/hangs/defect-handling
 * before being written here). `roots`/`input`/`output`/`shape` on the graph are all COMPUTED, never authored.
 */
const stubCtx: ActionCtx = { c: {} as unknown as Context, userId: "", param: () => undefined };

describe("sulukFmt.branch — real, type-checked conditional routing over a node's own declared cases", () => {
  test("runs exactly the case the discriminator selects, not the others", async () => {
    let paidRan = false;
    let invoiceRan = false;
    const paid = sulukFn({ run: (ctx: ActionCtx, method: "card" | "check") => Effect.sync(() => { paidRan = true; return "paid" as const; }) });
    const invoice = sulukFn({ run: (ctx: ActionCtx, method: "card" | "check") => Effect.sync(() => { invoiceRan = true; return "invoice" as const; }) });
    const route = sulukFmt.branch({ paid, invoice }, (method) => (method === "card" ? "paid" : "invoice"));
    expect(await Effect.runPromise(route.run(stubCtx, "card"))).toBe("paid");
    expect(paidRan).toBe(true);
    expect(invoiceRan).toBe(false);
  });

  test("an unrecognized discriminator result dies rather than silently picking a case", async () => {
    const a = sulukFn({ run: (ctx: ActionCtx, input: void) => Effect.succeed("a" as const) });
    // deliberately cast an out-of-range key past the type system, mirroring a real runtime data-quality failure.
    const route = sulukFmt.branch({ a }, () => "nonexistent" as never);
    const failure = await Effect.runPromiseExit(route.run(stubCtx, undefined));
    expect(failure._tag).toBe("Failure");
  });

  test("labeled: adds a decision node (shape auto-computes to \"branch\") with a \"branch\" edge per case, keyed by the case name", () => {
    const paid = sulukFn({ node: { label: "payments.card", kind: "internal" }, run: (ctx: ActionCtx, m: string) => Effect.succeed("paid") });
    const invoice = sulukFn({ node: { label: "payments.invoice", kind: "internal" }, run: (ctx: ActionCtx, m: string) => Effect.succeed("invoice") });
    const route = sulukFmt.branch({ paid, invoice }, (m: string) => (m === "card" ? "paid" : "invoice"), { label: "payments.route" });
    const g = route.slice.runGraph!;
    const decision = g.nodes.find((n) => n.label === "payments.route")!;
    expect(decision.shape).toBe("branch");
    const branchEdges = g.edges.filter((e) => e.on === "branch").sort((x, y) => x.when!.localeCompare(y.when!));
    expect(branchEdges).toEqual([
      { to: "payments.invoice", after: ["payments.route"], on: "branch", when: "invoice" },
      { to: "payments.card", after: ["payments.route"], on: "branch", when: "paid" },
    ]);
  });

  test("opts.describe (C107) supplies OPTIONAL human-readable prose per case — supplementary to `when`, never a substitute or an executable predicate", () => {
    const paid = sulukFn({ node: { label: "payments.card", kind: "internal" }, run: (ctx: ActionCtx, m: string) => Effect.succeed("paid") });
    const invoice = sulukFn({ node: { label: "payments.invoice", kind: "internal" }, run: (ctx: ActionCtx, m: string) => Effect.succeed("invoice") });
    const route = sulukFmt.branch({ paid, invoice }, (m: string) => (m === "card" ? "paid" : "invoice"), {
      label: "payments.route",
      describe: { paid: "payment method is card" }, // invoice deliberately left undescribed — optional per case
    });
    const g = route.slice.runGraph!;
    const paidEdge = g.edges.find((e) => e.on === "branch" && e.when === "paid")!;
    const invoiceEdge = g.edges.find((e) => e.on === "branch" && e.when === "invoice")!;
    expect(paidEdge.guardDescription).toBe("payment method is card");
    expect(invoiceEdge.guardDescription).toBeUndefined();
  });

  test("a branch edge is FORWARD-PROGRESS, not error-path — both cases (and the decision node) stay real roots/terminals, never excluded", () => {
    const paid = sulukFn({ node: { label: "payments.card", kind: "internal" }, run: (ctx: ActionCtx, m: string) => Effect.succeed("paid") });
    const invoice = sulukFn({ node: { label: "payments.invoice", kind: "internal" }, run: (ctx: ActionCtx, m: string) => Effect.succeed("invoice") });
    const route = sulukFmt.branch({ paid, invoice }, (m: string) => (m === "card" ? "paid" : "invoice"), { label: "payments.route" });
    const g = route.slice.runGraph!;
    expect(g.roots).toEqual(["payments.route"]);
    expect(g.terminals.sort()).toEqual(["payments.card", "payments.invoice"]);
    // multiple terminals ⇒ honestly no single resultNode (mirrors an un-followed fan-out).
    expect(g.resultNode).toBeUndefined();
  });

  test("unlabeled: zero graph impact for the decision itself, but each case's OWN labeled graph still unions in", () => {
    const paid = sulukFn({ node: { label: "payments.card", kind: "internal" }, run: (ctx: ActionCtx, m: string) => Effect.succeed("paid") });
    const invoice = sulukFn({ run: (ctx: ActionCtx, m: string) => Effect.succeed("invoice") }); // unlabeled
    const route = sulukFmt.branch({ paid, invoice }, (m: string) => (m === "card" ? "paid" : "invoice"));
    const g = route.slice.runGraph!;
    expect(g.nodes.map((n) => n.label)).toEqual(["payments.card"]);
    expect(g.edges.filter((e) => e.on === "branch")).toEqual([]);
  });

  test("cost aggregation is the MAX across cases, not the sum — only one case ever actually runs", () => {
    const cheap = sulukFn({ cost: { components: [], infra: { "d1.read": 1 } }, run: (ctx: ActionCtx, n: number) => Effect.succeed(1) });
    const pricey = sulukFn({ cost: { components: [], infra: { "d1.write": 1, "d1.read": 5 } }, run: (ctx: ActionCtx, n: number) => Effect.succeed(2) });
    const route = sulukFmt.branch({ cheap, pricey }, (n: number) => (n > 0 ? "cheap" : "pricey"));
    expect(route.slice.cost?.infra).toEqual({ "d1.write": 1, "d1.read": 5 }); // pricey's own model, not a summed composite
  });

  test("dedupe/rateLimit: DISAGREEING cases yield an HONEST ABSENCE, never an arbitrary declaration-order pick", () => {
    const invoice = sulukFn({ dedupe: { ttlMs: 60_000, keySource: { header: "X-Invoice-Key" } }, run: (ctx: ActionCtx, m: string) => Effect.succeed("invoice") });
    const card = sulukFn({ dedupe: { ttlMs: 86_400_000, keySource: { header: "X-Card-Key" } }, run: (ctx: ActionCtx, m: string) => Effect.succeed("card") });
    const routeInvoiceFirst = sulukFmt.branch({ invoice, card }, (m: string) => (m === "card" ? "card" : "invoice"));
    const routeCardFirst = sulukFmt.branch({ card, invoice }, (m: string) => (m === "card" ? "card" : "invoice"));
    // regardless of declaration order OR which case a given call actually runs, disagreeing per-case budgets must
    // NEVER surface as a single static x-suluk-dedupe facet — @suluk/hono would enforce the WRONG case's budget.
    expect(routeInvoiceFirst.slice.dedupe).toBeUndefined();
    expect(routeCardFirst.slice.dedupe).toBeUndefined();
  });

  test("dedupe/rateLimit: cases that all declare the SAME value keep it (no real ambiguity)", () => {
    const SAME = { ttlMs: 60_000, keySource: { header: "Idempotency-Key" } as const };
    const a = sulukFn({ dedupe: SAME, run: (ctx: ActionCtx, m: string) => Effect.succeed("a") });
    const b = sulukFn({ dedupe: SAME, run: (ctx: ActionCtx, m: string) => Effect.succeed("b") });
    const route = sulukFmt.branch({ a, b }, (m: string) => (m === "a" ? "a" : "b"));
    expect(route.slice.dedupe).toEqual(SAME);
  });

  test("errors UNION across cases (documents every POSSIBLE path, since only one runs per call but any could)", () => {
    const OtherError = NotFoundError;
    const a = sulukFn({ errors: [NotFoundError], run: (ctx: ActionCtx, input: void): Effect.Effect<string, InstanceType<typeof NotFoundError>, never> => Effect.fail(new NotFoundError({ resource: "a" })) });
    const b = sulukFn({ errors: [OtherError], run: (ctx: ActionCtx, input: void) => Effect.succeed("b") });
    const route = sulukFmt.branch({ a, b }, (_input: void) => "a" as const);
    expect(route.slice.errors?.map((e) => e.errorTag)).toEqual(["NotFoundError"]);
  });

  test("a labeled branch nested inside a larger sulukFmt pipeline wires correctly from each case's own terminal", async () => {
    const gate = sulukFn({ node: { label: "gate", kind: "internal" }, run: () => Effect.succeed(1 as number) });
    const cheap = sulukFn({ node: { label: "cheap.op", kind: "internal" }, run: (ctx, n: number) => Effect.succeed(n + 1) });
    const pricey = sulukFn({ node: { label: "pricey.op", kind: "internal" }, run: (ctx, n: number) => Effect.succeed(n + 100) });
    const routed = sulukFmt.branch({ cheap, pricey }, (n: number) => (n < 10 ? "cheap" : "pricey"), { label: "decide" });
    const pipeline = sulukFmt(gate, routed);
    const g = pipeline.slice.runGraph!;
    expect(g.terminals.sort()).toEqual(["cheap.op", "pricey.op"]);
    expect(g.roots).toEqual(["gate"]);
    // the decision node depends on gate's terminal (sequential wiring still applies to the WHOLE branch construct).
    expect(g.edges.some((e) => e.to === "decide" && e.after.includes("gate"))).toBe(true);
    expect(await Effect.runPromise(pipeline.run(stubCtx, undefined))).toBe(2); // gate=1 → cheap.op(1)=2
  });
});

describe("sulukFmt.race — \"any\" join policy: first SUCCESS wins, real Effect concurrency (not Effect.raceAll's first-settlement)", () => {
  test("a slow success beats a fast failure — the race waits past the first failure for a later success", async () => {
    const fastFail = sulukFn({ errors: [NotFoundError], run: () => Effect.gen(function* () { yield* Effect.sleep("5 millis"); return yield* new NotFoundError({ resource: "x" }); }) });
    const slowSuccess = sulukFn({ run: () => Effect.gen(function* () { yield* Effect.sleep("40 millis"); return "won"; }) });
    const raced = sulukFmt.race([fastFail, slowSuccess]);
    expect(await Effect.runPromise(raced.run(stubCtx, undefined))).toBe("won");
  });

  test("a fast success beats a slow success", async () => {
    const fast = sulukFn({ run: () => Effect.succeed("fast") });
    const slow = sulukFn({ run: () => Effect.gen(function* () { yield* Effect.sleep("50 millis"); return "slow"; }) });
    expect(await Effect.runPromise(sulukFmt.race([fast, slow]).run(stubCtx, undefined))).toBe("fast");
  });

  test("if EVERY candidate fails, the whole race fails", async () => {
    const a = sulukFn({ errors: [NotFoundError], run: () => Effect.fail(new NotFoundError({ resource: "a" })) });
    const b = sulukFn({ errors: [NotFoundError], run: () => Effect.gen(function* () { yield* Effect.sleep("5 millis"); return yield* new NotFoundError({ resource: "b" }); }) });
    await expect(Effect.runPromise(sulukFmt.race([a, b]).run(stubCtx, undefined))).rejects.toThrow();
  });

  test("a losing (slower) branch is genuinely INTERRUPTED, not left running to completion in the background", async () => {
    let loserInterrupted = false;
    let loserCompleted = false;
    const winner = sulukFn({ run: () => Effect.succeed("fast") });
    const loser = sulukFn({
      run: () => Effect.gen(function* () {
        yield* Effect.sleep("60 millis");
        loserCompleted = true;
        return "slow";
      }).pipe(Effect.onInterrupt(() => Effect.sync(() => { loserInterrupted = true; }))),
    });
    expect(await Effect.runPromise(sulukFmt.race([winner, loser]).run(stubCtx, undefined))).toBe("fast");
    // give the interrupted fiber's cleanup a moment to actually run (interruption is cooperative, not instantaneous).
    await new Promise((r) => setTimeout(r, 100));
    expect(loserInterrupted).toBe(true);
    expect(loserCompleted).toBe(false);
  });

  test("a DEFECT (thrown, not Effect.fail) on the last-standing candidate still surfaces — the matchEffect bug this was designed around", async () => {
    const dies = sulukFn({ run: () => Effect.sync((): string => { throw new Error("boom"); }) });
    const failure = await Effect.runPromiseExit(sulukFmt.race([dies]).run(stubCtx, undefined));
    expect(failure._tag).toBe("Failure");
  });

  test("labeled: adds a synthetic join(\"any\")+aggregate(\"first\") node as the sole terminal", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: () => Effect.succeed(2) });
    const raced = sulukFmt.race([a, b], { label: "pick-fastest" });
    const g = raced.slice.runGraph!;
    const joinNode = g.nodes.find((n) => n.label === "pick-fastest")!;
    expect(joinNode.join).toEqual({ policy: "any" });
    expect(joinNode.aggregate).toEqual({ strategy: "first" });
    expect(joinNode.shape).toBe("join");
    expect(g.resultNode).toBe("pick-fastest");
    expect(g.edges.some((e) => e.to === "pick-fastest" && e.after.sort().join(",") === "a,b")).toBe(true);
  });

  test("unlabeled: zero graph impact beyond the plain union of each candidate's own graph", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: () => Effect.succeed(2) });
    const g = sulukFmt.race([a, b]).slice.runGraph!;
    expect(g.terminals.sort()).toEqual(["a", "b"]);
    expect(g.resultNode).toBeUndefined();
  });

  test("cost SUMs across candidates (every one genuinely runs concurrently, unlike branch)", () => {
    const a = sulukFn({ cost: { components: [], infra: { "d1.read": 1 } }, run: () => Effect.succeed(1) });
    const b = sulukFn({ cost: { components: [], infra: { "d1.read": 2 } }, run: () => Effect.gen(function* () { yield* Effect.sleep("5 millis"); return 2; }) });
    expect(sulukFmt.race([a, b]).slice.cost?.infra).toEqual({ "d1.read": 3 });
  });

  test("a losing candidate's own `compensate` does NOT fire if it is interrupted mid-flight (a deliberate, named boundary)", async () => {
    let compensateRan = false;
    const comp = sulukFn({ run: () => Effect.sync(() => { compensateRan = true; }) });
    const winner = sulukFn({ run: () => Effect.succeed("fast") });
    const loser = sulukFn({ node: { label: "loser", kind: "internal", compensate: comp }, run: () => Effect.gen(function* () { yield* Effect.sleep("60 millis"); return "slow"; }) });
    expect(await Effect.runPromise(sulukFmt.race([winner, loser]).run(stubCtx, undefined))).toBe("fast");
    await new Promise((r) => setTimeout(r, 100));
    expect(compensateRan).toBe(false);
  });
});

describe("sulukFmt.quorum — \"quorum\" join policy: first N of M successes, real Effect concurrency", () => {
  test("resolves once `quorum` candidates succeed, as an array, interrupting the rest", async () => {
    const a = sulukFn({ run: () => Effect.succeed("a") });
    const b = sulukFn({ run: () => Effect.gen(function* () { yield* Effect.sleep("10 millis"); return "b"; }) });
    const c = sulukFn({ run: () => Effect.gen(function* () { yield* Effect.sleep("80 millis"); return "c"; }) });
    const result = await Effect.runPromise(sulukFmt.quorum([a, b, c], 2).run(stubCtx, undefined));
    expect(result.sort()).toEqual(["a", "b"]);
  });

  test("fails EAGERLY once quorum becomes mathematically unreachable, without waiting for every candidate", async () => {
    const fail1 = sulukFn({ errors: [NotFoundError], run: () => Effect.fail(new NotFoundError({ resource: "1" })) });
    const fail2 = sulukFn({ errors: [NotFoundError], run: () => Effect.gen(function* () { yield* Effect.sleep("5 millis"); return yield* new NotFoundError({ resource: "2" }); }) });
    const slowSuccess = sulukFn({ run: () => Effect.gen(function* () { yield* Effect.sleep("300 millis"); return "late"; }) });
    // quorum=3 with only 3 candidates: TWO failures make quorum unreachable (need all 3, only 1 could still succeed).
    const started = Date.now();
    await expect(Effect.runPromise(sulukFmt.quorum([fail1, fail2, slowSuccess], 3).run(stubCtx, undefined))).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(250); // failed well before slowSuccess's 300ms would have resolved
  });

  test("a DEFECT counts toward the failure budget (not just Effect.fail) — the matchEffect bug this was designed around", async () => {
    const dies = sulukFn({ run: () => Effect.sync((): string => { throw new Error("boom"); }) });
    const fails = sulukFn({ errors: [NotFoundError], run: () => Effect.fail(new NotFoundError({ resource: "x" })) });
    // quorum=2 of 2: BOTH must succeed; one dies, one fails — quorum is unreachable the instant either settles.
    await expect(Effect.runPromise(sulukFmt.quorum([dies, fails], 2).run(stubCtx, undefined))).rejects.toThrow();
  });

  test("quorum <= 0 resolves an empty array immediately, without running any candidate", async () => {
    let ran = false;
    const a = sulukFn({ run: () => Effect.sync(() => { ran = true; return "a"; }) });
    const result = await Effect.runPromise(sulukFmt.quorum([a], 0).run(stubCtx, undefined));
    expect(result).toEqual([]);
    expect(ran).toBe(false);
  });

  test("quorum > candidate count dies rather than hanging", async () => {
    const a = sulukFn({ run: () => Effect.succeed("a") });
    const failure = await Effect.runPromiseExit(sulukFmt.quorum([a], 5).run(stubCtx, undefined));
    expect(failure._tag).toBe("Failure");
  });

  test("labeled: adds a synthetic join(\"quorum\")+aggregate(\"array\") node as the sole terminal", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: () => Effect.succeed(2) });
    const q = sulukFmt.quorum([a, b], 1, { label: "any-one" });
    const g = q.slice.runGraph!;
    const joinNode = g.nodes.find((n) => n.label === "any-one")!;
    expect(joinNode.join).toEqual({ policy: "quorum", quorum: 1 });
    expect(joinNode.aggregate).toEqual({ strategy: "array" });
    expect(g.resultNode).toBe("any-one");
  });
});

describe("sulukFmt.all — opts.label (C106): the existing \"all\" policy gets an explicit, defined resultNode when labeled", () => {
  test("unlabeled stays byte-for-byte the pre-C106 shape: multiple terminals, no resultNode", () => {
    const item = sulukFn({ node: { label: "item", kind: "internal" }, run: () => Effect.succeed("i") });
    const count = sulukFn({ node: { label: "count", kind: "internal" }, run: () => Effect.succeed(1) });
    const g = sulukFmt.all({ item, count }).slice.runGraph!;
    expect(g.terminals.sort()).toEqual(["count", "item"]);
    expect(g.resultNode).toBeUndefined();
  });

  test("labeled: a synthetic join(\"all\")+aggregate(\"object\") node becomes the sole terminal/resultNode", async () => {
    const item = sulukFn({ node: { label: "item", kind: "internal" }, run: () => Effect.succeed("i") });
    const count = sulukFn({ node: { label: "count", kind: "internal" }, run: () => Effect.succeed(1) });
    const fan = sulukFmt.all({ item, count }, { label: "combine" });
    const g = fan.slice.runGraph!;
    const joinNode = g.nodes.find((n) => n.label === "combine")!;
    expect(joinNode.join).toEqual({ policy: "all" });
    expect(joinNode.aggregate).toEqual({ strategy: "object" });
    expect(g.resultNode).toBe("combine");
    expect(g.terminals).toEqual(["combine"]);
    // runtime behavior is UNCHANGED by labeling — still waits for both, still merges into { item, count }.
    expect(await Effect.runPromise(fan.run(stubCtx, undefined))).toEqual({ item: "i", count: 1 });
  });

  test("two DIFFERENT nodes sharing the same label is an authoring bug — fails loud at composition time instead of silently dropping the second", () => {
    const fetchA = sulukFn({ node: { label: "fetch", kind: "internal" }, ok: { schema: z.object({ a: z.string() }) }, run: () => Effect.succeed({ a: "x" }) });
    const fetchB = sulukFn({ node: { label: "fetch", kind: "internal" }, ok: { schema: z.object({ b: z.number() }) }, run: () => Effect.succeed({ b: 1 }) });
    expect(() => sulukFmt.all({ a: fetchA, b: fetchB })).toThrow(/share the label "fetch"/);
  });

  test("the SAME node reused twice under different keys is NOT a collision — no throw", async () => {
    const shared = sulukFn({ node: { label: "shared", kind: "internal" }, ok: { schema: z.object({ v: z.number() }) }, run: () => Effect.succeed({ v: 1 }) });
    const fan = sulukFmt.all({ a: shared, b: shared });
    expect(fan.slice.runGraph!.nodes.length).toBe(1);
    expect(await Effect.runPromise(fan.run(stubCtx, undefined))).toEqual({ a: { v: 1 }, b: { v: 1 } });
  });
});

describe("graph-level input/output/roots (C106) — computed, honestly absent when ambiguous", () => {
  test("a linear pipeline's graph-level input/output mirror its sole root/resultNode", () => {
    const Body = z.object({ title: z.string() });
    const Out = z.object({ id: z.string() });
    const a = sulukFn({ node: { label: "a", kind: "internal" }, body: Body, run: (ctx, b: { title: string }) => Effect.succeed(b) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, ok: { schema: Out }, run: () => Effect.succeed({ id: "1" }) });
    const g = sulukFmt(a, b).slice.runGraph!;
    expect(g.roots).toEqual(["a"]);
    expect(g.input).toMatchObject({ type: "object", properties: { title: { type: "string" } } });
    expect(g.output).toMatchObject({ type: "object", properties: { id: { type: "string" } } });
  });

  test("multiple roots (an un-followed fan-out) ⇒ no graph-level input; multiple terminals ⇒ no graph-level output", () => {
    const item = sulukFn({ node: { label: "item", kind: "internal" }, body: z.object({ x: z.string() }), run: () => Effect.succeed("i") });
    const count = sulukFn({ node: { label: "count", kind: "internal" }, body: z.object({ y: z.number() }), run: () => Effect.succeed(1) });
    const g = sulukFmt.all({ item, count }).slice.runGraph!;
    expect(g.roots.sort()).toEqual(["count", "item"]);
    expect(g.input).toBeUndefined();
    expect(g.output).toBeUndefined();
  });
});

describe("lintRunGraph — cycle detection still catches a cycle formed through a \"branch\" edge", () => {
  test("reusing a branch's own case node as a LATER pipeline stage forms a real self-referential cycle — rejected eagerly", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const branched = sulukFmt.branch({ a }, () => "a" as const, { label: "decide" }); // decide --branch--> a
    // sulukFmt(branched, a) wires a NEW success edge {to:"a", after:["a"]} (a already IS branched's own terminal) — a self-loop.
    expect(() => sulukFmt(branched, a)).toThrow(/cycle detected/);
  });

  test("lintRunGraph, called standalone, rejects a hand-built graph with a \"branch\" edge into an unknown node", () => {
    const g = { nodes: [{ label: "decide", kind: "internal" as const }], edges: [{ to: "missing", after: ["decide"], on: "branch" as const, when: "x" }] };
    expect(() => lintRunGraph(g)).toThrow(/unknown node/);
  });
});

describe("sulukRoute propagates the extended graph facet (roots/input/output/shape/join/aggregate) onto the contract", () => {
  test("a labeled race nested in a route shows up fully on the derived contract's runGraph", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed({ ok: true }) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: () => Effect.gen(function* () { yield* Effect.sleep("5 millis"); return { ok: true }; }) });
    const raced = sulukFmt.race([a, b], { label: "fastest" });
    const route = sulukFmt(
      sulukFn({ method: "get", path: "/api/fastest", roles: ["signed-in"], summary: "Fastest.", view: view("result"), ok: { schema: z.object({ ok: z.boolean() }) }, run: (ctx) => Effect.succeed(undefined) }),
      raced,
    );
    const { contract } = sulukRoute(route, { provide: (_env, p) => p as never });
    const runGraph = (contract as { runGraph?: { nodes: { label: string; join?: unknown }[]; resultNode?: string; roots: string[] } }).runGraph;
    expect(runGraph).toBeDefined();
    expect(runGraph!.resultNode).toBe("fastest");
    expect(runGraph!.nodes.find((n) => n.label === "fastest")?.join).toEqual({ policy: "any" });
  });
});
