import { test, expect, describe } from "bun:test";
import { Effect } from "effect";
import { z } from "zod";
import type { Context } from "hono";
import { sulukFn, sulukFmt, ref, NotFoundError, ConflictError, type ActionCtx } from "../src/index";

type NFI = InstanceType<typeof NotFoundError>;
type CFI = InstanceType<typeof ConflictError>;

/**
 * PIPELINE-WIDE error recovery + custom result projection (C107) — the two SAFE extensions built after the operator
 * confirmed there is no non-TypeScript consumer needing a portable predicate/value-ref language: both stay on the
 * "real, type-checked TypeScript function at authoring time, descriptive tag on the wire" side of the line every
 * prior C104–C106 primitive already drew; neither adds an interpreter or a second execution path.
 */
const stubCtx: ActionCtx = { c: {} as unknown as Context, userId: "", param: () => undefined };

describe("sulukFmt.recover — PIPELINE-WIDE typed error recovery (beyond a single node's own declared errors)", () => {
  test("catches an error from the FIRST step of a multi-step pipeline, not just the last", async () => {
    const first = sulukFn({ errors: [NotFoundError], run: (ctx: ActionCtx, input: string) => Effect.fail(new NotFoundError({ resource: input })) });
    const second = sulukFn({ run: (ctx: ActionCtx, x: never): Effect.Effect<string, NFI, never> => Effect.succeed("unreachable") });
    const pipeline = sulukFmt(first, second);
    const fallback = sulukFn({ run: (ctx: ActionCtx, input: string) => Effect.succeed(`fallback-for-${input}`) });
    const recovered = sulukFmt.recover(pipeline, { NotFoundError: fallback });
    expect(await Effect.runPromise(recovered.run(stubCtx, "widget"))).toBe("fallback-for-widget");
  });

  test("catches an error from a LATER step too (not scoped to any single node)", async () => {
    const first = sulukFn({ run: (ctx: ActionCtx, input: string) => Effect.succeed(input.length) });
    const second = sulukFn({ errors: [ConflictError], run: (ctx: ActionCtx, n: number): Effect.Effect<string, CFI, never> => Effect.fail(new ConflictError({ resource: "x", reason: "busy" })) });
    const pipeline = sulukFmt(first, second);
    const fallback = sulukFn({ run: (ctx: ActionCtx, input: string) => Effect.succeed(`recovered-${input}`) });
    const recovered = sulukFmt.recover(pipeline, { ConflictError: fallback });
    expect(await Effect.runPromise(recovered.run(stubCtx, "abc"))).toBe("recovered-abc");
  });

  test("the fallback receives the PIPELINE's own original input, not any intermediate value", async () => {
    let receivedInput: unknown;
    const first = sulukFn({ run: (ctx: ActionCtx, input: { id: string }) => Effect.succeed(input.id.length) });
    const second = sulukFn({ errors: [NotFoundError], run: (ctx: ActionCtx, n: number): Effect.Effect<string, NFI, never> => Effect.fail(new NotFoundError({ resource: "x" })) });
    const pipeline = sulukFmt(first, second);
    const fallback = sulukFn({ run: (ctx: ActionCtx, input: { id: string }) => Effect.sync(() => { receivedInput = input; return "ok"; }) });
    await Effect.runPromise(sulukFmt.recover(pipeline, { NotFoundError: fallback }).run(stubCtx, { id: "abc" }));
    expect(receivedInput).toEqual({ id: "abc" });
  });

  test("an UNDECLARED tag propagates unaffected (only the declared tags are caught)", async () => {
    const step = sulukFn({ errors: [ConflictError], run: (): Effect.Effect<string, CFI, never> => Effect.fail(new ConflictError({ resource: "x", reason: "busy" })) });
    const fallback = sulukFn({ run: () => Effect.succeed("recovered") });
    const recovered = sulukFmt.recover(sulukFmt(step), { NotFoundError: fallback }); // wrong tag declared
    await expect(Effect.runPromise(recovered.run(stubCtx, undefined))).rejects.toThrow();
  });

  test("a recovered tag is REMOVED from the wrapped pipeline's own documented errors; a fallback's OWN new errors are added", () => {
    const step = sulukFn({ errors: [NotFoundError], run: (): Effect.Effect<string, NFI, never> => Effect.fail(new NotFoundError({ resource: "x" })) });
    const fallback = sulukFn({ errors: [ConflictError], run: () => Effect.succeed("ok") });
    const recovered = sulukFmt.recover(sulukFmt(step), { NotFoundError: fallback });
    const tags = recovered.slice.errors?.map((e) => e.errorTag) ?? [];
    expect(tags).not.toContain("NotFoundError"); // handled — no longer propagates
    expect(tags).toContain("ConflictError"); // the fallback's own new failure mode
  });

  test("wires an \"error\" edge per recovered tag from the pipeline's own roots to the fallback's entry, and serializes the SAME policy as recoverPolicy", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, errors: [NotFoundError], run: () => Effect.fail(new NotFoundError({ resource: "x" })) });
    const b = sulukFn({ node: { label: "b", kind: "internal" }, run: (ctx: ActionCtx, x: never) => Effect.succeed("unreachable") });
    const fallback = sulukFn({ node: { label: "fallback", kind: "internal" }, run: () => Effect.succeed("ok") });
    const recovered = sulukFmt.recover(sulukFmt(a, b), { NotFoundError: fallback });
    const g = recovered.slice.runGraph!;
    expect(g.nodes.map((n) => n.label).sort()).toEqual(["a", "b", "fallback"]);
    expect(g.edges).toContainEqual({ to: "fallback", after: ["a"], on: "error", errorTag: "NotFoundError" });
    expect(g.recoverPolicy).toEqual([{ errorTag: "NotFoundError", to: "fallback" }]);
    // the recovery edge is error-path, not forward-progress — it doesn't disturb the pipeline's own success shape.
    expect(g.terminals).toEqual(["b"]);
  });

  test("an UNLABELED fallback contributes no edge/recoverPolicy entry — it still runs for real, only the DATA can't reference it", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, errors: [NotFoundError], run: (): Effect.Effect<string, NFI, never> => Effect.fail(new NotFoundError({ resource: "x" })) });
    const fallback = sulukFn({ run: () => Effect.succeed("ok") }); // unlabeled
    const g = sulukFmt.recover(sulukFmt(a), { NotFoundError: fallback }).slice.runGraph!;
    expect(g.nodes.map((n) => n.label)).toEqual(["a"]);
    expect(g.edges.filter((e) => e.on === "error")).toEqual([]);
    expect(g.recoverPolicy).toBeUndefined();
  });

  test("composes with sulukFmt.branch — recovering an error from whichever case actually ran", async () => {
    const cardCase = sulukFn({ errors: [ConflictError], run: (ctx: ActionCtx, m: string) => Effect.fail(new ConflictError({ resource: "card", reason: "declined" })) });
    const checkCase = sulukFn({ run: (ctx: ActionCtx, m: string) => Effect.succeed("check-ok") });
    const branched = sulukFmt.branch({ cardCase, checkCase }, (m: string) => (m === "card" ? "cardCase" : "checkCase"));
    const fallback = sulukFn({ run: (ctx: ActionCtx, m: string) => Effect.succeed(`declined-fallback-for-${m}`) });
    const recovered = sulukFmt.recover(branched, { ConflictError: fallback });
    expect(await Effect.runPromise(recovered.run(stubCtx, "card"))).toBe("declined-fallback-for-card");
    expect(await Effect.runPromise(recovered.run(stubCtx, "check"))).toBe("check-ok");
  });
});

describe("opts.project (C107) — a real, author-supplied merge FUNCTION reshapes a fan-out's result", () => {
  test("sulukFmt.all: project reshapes the keyed object into anything the author wants", async () => {
    const item = sulukFn({ run: () => Effect.succeed({ id: "1", title: "Widget" }) });
    const count = sulukFn({ run: () => Effect.succeed(3) });
    const fan = sulukFmt.all({ item, count }, { project: (outs) => `${outs.item.title} (${outs.count})` });
    expect(await Effect.runPromise(fan.run(stubCtx, undefined))).toBe("Widget (3)");
  });

  test("sulukFmt.all: ok.schema is left undocumented when project is given (can't derive a schema from an arbitrary function)", () => {
    const item = sulukFn({ ok: { schema: z.object({ id: z.string() }) }, run: () => Effect.succeed({ id: "1" }) });
    const fan = sulukFmt.all({ item }, { project: (outs) => outs.item.id });
    expect(fan.slice.ok).toBeUndefined();
  });

  test("sulukFmt.all: labeled + project stamps aggregate:{strategy:\"custom\"} instead of \"object\"", () => {
    const item = sulukFn({ node: { label: "item", kind: "internal" }, run: () => Effect.succeed({ id: "1" }) });
    const fan = sulukFmt.all({ item }, { label: "combine", project: (outs) => outs.item.id });
    const joinNode = fan.slice.runGraph!.nodes.find((n) => n.label === "combine")!;
    expect(joinNode.aggregate).toEqual({ strategy: "custom" });
  });

  test("sulukFmt.race: project reshapes the winning branch's own output", async () => {
    const a = sulukFn({ run: () => Effect.succeed(21) });
    const b = sulukFn({ run: () => Effect.gen(function* () { yield* Effect.sleep("30 millis"); return 99; }) });
    const raced = sulukFmt.race([a, b], { project: (n) => n * 2 });
    expect(await Effect.runPromise(raced.run(stubCtx, undefined))).toBe(42);
  });

  test("sulukFmt.race: labeled + project stamps aggregate:{strategy:\"custom\"} instead of \"first\"", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const raced = sulukFmt.race([a], { label: "pick", project: (n) => n * 10 });
    const joinNode = raced.slice.runGraph!.nodes.find((n) => n.label === "pick")!;
    expect(joinNode.aggregate).toEqual({ strategy: "custom" });
  });

  test("sulukFmt.quorum: project reshapes the array of quorum-many outputs", async () => {
    const a = sulukFn({ run: () => Effect.succeed(1) });
    const b = sulukFn({ run: () => Effect.succeed(2) });
    const q = sulukFmt.quorum([a, b], 2, { project: (outs) => outs.reduce((s, n) => s + n, 0) });
    expect(await Effect.runPromise(q.run(stubCtx, undefined))).toBe(3);
  });

  test("sulukFmt.quorum: labeled + project stamps aggregate:{strategy:\"custom\"} instead of \"array\"", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const q = sulukFmt.quorum([a], 1, { label: "combine", project: (outs) => outs.length });
    const joinNode = q.slice.runGraph!.nodes.find((n) => n.label === "combine")!;
    expect(joinNode.aggregate).toEqual({ strategy: "custom" });
  });
});

describe("aggregateProjection (C107) — a first-class serialization of which output key came from which node", () => {
  test("sulukFmt.all: COMPUTED key -> source node label mapping for the default \"object\" strategy", () => {
    const item = sulukFn({ node: { label: "item.fetch", kind: "internal" }, run: () => Effect.succeed({ id: "1" }) });
    const count = sulukFn({ node: { label: "count.tally", kind: "internal" }, run: () => Effect.succeed(3) });
    const fan = sulukFmt.all({ item, count }, { label: "combine" });
    const joinNode = fan.slice.runGraph!.nodes.find((n) => n.label === "combine")!;
    expect(joinNode.aggregateProjection).toEqual({ item: "item.fetch", count: "count.tally" });
  });

  test("sulukFmt.all: absent when NO branch is labeled — nothing meaningful to project onto", () => {
    const item = sulukFn({ run: () => Effect.succeed({ id: "1" }) });
    const fan = sulukFmt.all({ item }, { label: "combine" });
    const joinNode = fan.slice.runGraph!.nodes.find((n) => n.label === "combine")!;
    expect(joinNode.aggregateProjection).toBeUndefined();
  });

  test("sulukFmt.all: opts.describe supplies free-text prose for a CUSTOM projection (never a resolvable reference)", () => {
    const item = sulukFn({ node: { label: "item", kind: "internal" }, run: () => Effect.succeed({ id: "1", title: "Widget" }) });
    const fan = sulukFmt.all({ item }, { label: "combine", project: (outs) => outs.item.title, describe: "the item's own title, unwrapped" });
    const joinNode = fan.slice.runGraph!.nodes.find((n) => n.label === "combine")!;
    expect(joinNode.aggregateProjection).toBe("the item's own title, unwrapped");
  });

  test("sulukFmt.race/quorum: no computed mapping (unordered/ordered results have no fixed keys) — only opts.describe, only with project", () => {
    const a = sulukFn({ node: { label: "a", kind: "internal" }, run: () => Effect.succeed(1) });
    const raced = sulukFmt.race([a], { label: "pick" });
    expect(raced.slice.runGraph!.nodes.find((n) => n.label === "pick")!.aggregateProjection).toBeUndefined();
    const describedRace = sulukFmt.race([a], { label: "pick2", project: (n) => n * 2, describe: "doubled" });
    expect(describedRace.slice.runGraph!.nodes.find((n) => n.label === "pick2")!.aggregateProjection).toBe("doubled");
  });
});

describe("node.recover — a node's own recover map, SERIALIZED as a first-class list (not only inferable from edges)", () => {
  test("sulukFn's node.recover is stamped directly on the node, matching its own recover edges exactly", () => {
    const fallback = sulukFn({ node: { label: "fallback", kind: "internal" }, run: () => Effect.succeed("ok") });
    const primary = sulukFn({
      node: { label: "primary", kind: "external", recover: { NotFoundError: fallback } },
      errors: [NotFoundError],
      run: (): Effect.Effect<string, NFI, never> => Effect.fail(new NotFoundError({ resource: "x" })),
    });
    const g = primary.slice.runGraph!;
    const node = g.nodes.find((n) => n.label === "primary")!;
    expect(node.recover).toEqual([{ errorTag: "NotFoundError", to: "fallback" }]);
    // the SAME fact, both ways — the node field can never disagree with the edge it's derived from.
    const edge = g.edges.find((e) => e.on === "error" && e.errorTag === "NotFoundError")!;
    expect(node.recover![0]).toEqual({ errorTag: edge.errorTag!, to: edge.to });
  });

  test("absent when the node declares no recover", () => {
    const plain = sulukFn({ node: { label: "plain", kind: "internal" }, run: () => Effect.succeed("ok") });
    expect(plain.slice.runGraph!.nodes[0]!.recover).toBeUndefined();
  });
});

describe("retry.whenErrorTags (C108) — DECLARED-AND-ENFORCED: a real Schedule.recurWhile filter, only known-safe failures are retried", () => {
  test("a tag IN the allow-list retries as normal", async () => {
    let attempts = 0;
    const flaky = sulukFn({
      node: { label: "flaky", kind: "internal", retry: { times: 2, whenErrorTags: ["NotFoundError"] } },
      errors: [NotFoundError],
      run: (): Effect.Effect<string, NFI, never> => Effect.gen(function* () {
        attempts++;
        if (attempts < 3) return yield* new NotFoundError({ resource: "x" });
        return "ok";
      }),
    });
    expect(await Effect.runPromise(flaky.run(stubCtx, undefined))).toBe("ok");
    expect(attempts).toBe(3);
  });

  test("a tag NOT in the allow-list propagates immediately on the FIRST failure — no blind retry of unsafe work", async () => {
    let attempts = 0;
    const risky = sulukFn({
      node: { label: "risky", kind: "internal", retry: { times: 5, whenErrorTags: ["NotFoundError"] } },
      errors: [ConflictError],
      run: (): Effect.Effect<string, CFI, never> => Effect.sync(() => { attempts++; }).pipe(
        Effect.flatMap(() => Effect.fail(new ConflictError({ resource: "x", reason: "not retryable" }))),
      ),
    });
    await expect(Effect.runPromise(risky.run(stubCtx, undefined))).rejects.toThrow();
    expect(attempts).toBe(1); // stopped after the FIRST attempt — ConflictError is not in the allow-list
  });

  test("no whenErrorTags declared retries on ANY tag (unchanged pre-C108 behavior)", async () => {
    let attempts = 0;
    const flaky = sulukFn({
      node: { label: "flaky2", kind: "internal", retry: { times: 2 } },
      errors: [ConflictError],
      run: (): Effect.Effect<string, CFI, never> => Effect.gen(function* () {
        attempts++;
        if (attempts < 3) return yield* new ConflictError({ resource: "x", reason: "busy" });
        return "ok";
      }),
    });
    expect(await Effect.runPromise(flaky.run(stubCtx, undefined))).toBe("ok");
    expect(attempts).toBe(3);
  });
});

describe("effect / requiresIdempotencyKey (C108) — DECLARED-ONLY (advisory): visible on the graph, never enforced", () => {
  test("both are stamped on the node exactly as declared, with zero effect on runtime behavior", async () => {
    let attempts = 0;
    const charge = sulukFn({
      node: { label: "payments.charge", kind: "external", effect: "write", requiresIdempotencyKey: true },
      run: () => Effect.sync(() => { attempts++; return "charged"; }),
    });
    const node = charge.slice.runGraph!.nodes[0]!;
    expect(node.effect).toBe("write");
    expect(node.requiresIdempotencyKey).toBe(true);
    // calling it twice actually runs it twice — nothing here deduplicates or caches; that's the honest point.
    await Effect.runPromise(charge.run(stubCtx, undefined));
    await Effect.runPromise(charge.run(stubCtx, undefined));
    expect(attempts).toBe(2);
  });

  test("idempotencyKeySource declares WHERE the key comes from (header or body field) — documentation only, nothing reads the request", async () => {
    let ran = 0;
    const charge = sulukFn({
      node: {
        label: "payments.charge2", kind: "external",
        requiresIdempotencyKey: true, idempotencyKeySource: { header: "Idempotency-Key" },
      },
      run: () => Effect.sync(() => { ran++; return "charged"; }),
    });
    expect(charge.slice.runGraph!.nodes[0]!.idempotencyKeySource).toEqual({ header: "Idempotency-Key" });
    // still no enforcement — declaring the source doesn't make duplicate calls collapse to one.
    await Effect.runPromise(charge.run(stubCtx, undefined));
    await Effect.runPromise(charge.run(stubCtx, undefined));
    expect(ran).toBe(2);

    const invoiced = sulukFn({
      node: { label: "invoice.create", kind: "internal", idempotencyKeySource: { bodyField: "clientRequestId" } },
      run: () => Effect.succeed("ok"),
    });
    expect(invoiced.slice.runGraph!.nodes[0]!.idempotencyKeySource).toEqual({ bodyField: "clientRequestId" });
  });

  test("absent by default", () => {
    const plain = sulukFn({ node: { label: "plain2", kind: "internal" }, run: () => Effect.succeed("ok") });
    const node = plain.slice.runGraph!.nodes[0]!;
    expect(node.effect).toBeUndefined();
    expect(node.requiresIdempotencyKey).toBeUndefined();
  });
});

describe("effect / node.dedupe (C110) — DECLARED-ONLY reflection of the REAL @suluk/hono enforcement", () => {
  test("stamped on the node exactly as declared; the graph itself still enforces nothing (calling twice runs twice)", async () => {
    let attempts = 0;
    const charge = sulukFn({
      node: {
        label: "payments.charge3", kind: "external",
        requiresIdempotencyKey: true, idempotencyKeySource: { header: "Idempotency-Key" },
        dedupe: { ttlMs: 60_000, scope: "charge" },
      },
      run: () => Effect.sync(() => { attempts++; return "charged"; }),
    });
    expect(charge.slice.runGraph!.nodes[0]!.dedupe).toEqual({ ttlMs: 60_000, scope: "charge" });
    // the REAL dedupe/result-cache enforcement lives at @suluk/hono's HTTP boundary (enforceDedupe + DedupeStore),
    // not here — this is a graph-level mirror of that policy for a reader, not a second enforcement point.
    await Effect.runPromise(charge.run(stubCtx, undefined));
    await Effect.runPromise(charge.run(stubCtx, undefined));
    expect(attempts).toBe(2);
  });

  test("absent by default", () => {
    const plain = sulukFn({ node: { label: "plain3", kind: "internal" }, run: () => Effect.succeed("ok") });
    expect(plain.slice.runGraph!.nodes[0]!.dedupe).toBeUndefined();
  });

  test("ref() carries the same declared-only dedupe reflection", () => {
    const stub = ref("payments.refund", { kind: "external", dedupe: { ttlMs: 30_000 } });
    expect(stub.slice.runGraph!.nodes[0]!.dedupe).toEqual({ ttlMs: 30_000 });
  });
});
