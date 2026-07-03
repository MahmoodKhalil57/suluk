/**
 * An ACTION PIPELINE — a walkable PLAN TREE (`root`) plus the composed Effect. A route's `run` is one of these:
 * {@link effectPipeRoute} folds the tree to derive the whole contract (request ← the entry leaf's `input`; response ← the
 * terminal's `wrap`; errors ← the union of every leaf's `errors`; cost ← the SUM of every leaf's `cost`).
 *
 * The tree has four node kinds, and this is the RECURSION: a node's children are themselves nodes, so logic composes to
 * arbitrary depth and the contract MERGES up the tree, effect.ts-style:
 *   • `leaf`   — one {@link ServiceAction} (the base case).
 *   • `seq`    — run steps head→tail, threading each domain output into the next as its `input` (`pipeline`/`chain` build this).
 *   • `all`    — FAN OUT: run the branches on the same input, tuple their outputs; the terminal ZIPS their envelopes into one
 *                merged wire body (`{ todo } ⊕ { count } = { todo, count }`). This is the combinator the linear pipeline lacked.
 *   • `branch` — CONDITIONAL: pick `then`/`else` on the input; the arms' Out/Err/R union.
 *
 * Type inference: `Err` and `R` UNION at every node and depth (a union never drops a member — no cliff, better than the linear
 * `pipeline(...)` which degraded them to `any` past 3 steps). `all`'s Out is a position-preserving mapped TUPLE. `seq`'s
 * step-to-step Out keeps the honest cliff past the typed overloads — `chain`/`pipeline` (≤3) stay end-to-end typed; nest for more.
 */
import { Effect } from "effect";
import { z } from "zod";
import type { ActionCtx, AnyServiceAction, Envelope, ServiceAction } from "./action";

const PIPELINE = Symbol.for("@suluk/effect/pipeline");

/**
 * The PLAN TREE — the recursive AST a pipeline folds. A discriminated union on `kind`, so every walk ({@link foldPlan},
 * {@link leavesOf}, {@link terminalWrapOf}) is exhaustive and a future node kind is a COMPILE error, never a silent `any`.
 */
export type PlanNode =
  | { readonly kind: "leaf"; readonly action: AnyServiceAction }
  | { readonly kind: "seq"; readonly steps: readonly PlanNode[] }
  | { readonly kind: "all"; readonly branches: readonly PlanNode[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { readonly kind: "branch"; readonly pick: (input: any) => boolean; readonly then: PlanNode; readonly else: PlanNode };

export interface ActionPipeline<In, Dom, Err, R> {
  readonly [PIPELINE]: true;
  /** THE AST ROOT — the plan tree, folded by effectPipeRoute to collect request/ok/errors/cost (a runtime walk; no request,
   *  no layer, because every schema fact is a static property on each leaf). */
  readonly root: PlanNode;
  /** every leaf action in execution order — the source of the errors UNION + the cost SUM (a flattened view of `root`). */
  readonly actions: readonly AnyServiceAction[];
  /** the composed Effect: folds the tree, threading `seq` outputs and tupling `all` branches. */
  readonly run: (ctx: ActionCtx, input: In) => Effect.Effect<Dom, Err, R>;
  /** the ENTRY leaf — the leftmost leaf reached in execution order, the source of `request.json` (its `input`). */
  readonly head: AnyServiceAction;
  /** the last leaf (vestigial back-compat handle); the true terminal WRAP is {@link terminalWrapOf}(root). */
  readonly terminal: AnyServiceAction;
}

/** Type guard — is `v` an {@link ActionPipeline}? */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPipeline = (v: unknown): v is ActionPipeline<any, any, any, any> =>
  typeof v === "object" && v !== null && (v as Record<symbol, unknown>)[PIPELINE] === true;

// ── TREE FOLDS (pure, synchronous — every schema fact is a static property) ─────────────────────────────────────────────

/** Flatten the tree to its leaf actions in execution order — the basis for the errors UNION and the cost SUM. */
export function leavesOf(node: PlanNode): AnyServiceAction[] {
  switch (node.kind) {
    case "leaf": return [node.action];
    case "seq": return node.steps.flatMap(leavesOf);
    case "all": return node.branches.flatMap(leavesOf);
    case "branch": return [...leavesOf(node.then), ...leavesOf(node.else)];
  }
  throw new Error("leavesOf: unreachable node kind");
}

/** The ENTRY leaf — the leftmost leaf reached in execution order. It receives the HTTP body, so its `input` is `request.json`. */
export function entryLeafOf(node: PlanNode): AnyServiceAction {
  switch (node.kind) {
    case "leaf": return node.action;
    case "seq": return entryLeafOf(node.steps[0]);
    case "all": return entryLeafOf(node.branches[0]);
    case "branch": return entryLeafOf(node.then);
  }
  throw new Error("entryLeafOf: unreachable node kind");
}

/** The terminal WRAP + status a node projects: a leaf's own `wrap`; a seq's last step; an `all`'s ZIPPED envelope; a branch's
 *  `then` arm (arms should share a wire shape — the `then` arm is the documented one). */
export interface TerminalWrap {
  readonly wrap: Envelope<unknown, unknown>;
  readonly status?: number;
}
export function terminalWrapOf(node: PlanNode): TerminalWrap {
  switch (node.kind) {
    case "leaf": return node.action.status !== undefined
      ? { wrap: node.action.wrap as Envelope<unknown, unknown>, status: node.action.status }
      : { wrap: node.action.wrap as Envelope<unknown, unknown> };
    case "seq": return terminalWrapOf(node.steps[node.steps.length - 1]);
    case "all": return mergeAllWrap(node.branches);
    case "branch": return terminalWrapOf(node.then);
  }
  throw new Error("terminalWrapOf: unreachable node kind");
}

/** Read a ZodObject's field map (zod v4 `.shape`, fallback `.def.shape`) — every envelope schema is a `z.object`, so an
 *  `all` node can MERGE its branches' objects into one wire body. */
function objectShape(schema: unknown): Record<string, z.ZodTypeAny> {
  const s = schema as { shape?: Record<string, z.ZodTypeAny>; def?: { shape?: Record<string, z.ZodTypeAny> } };
  return s?.shape ?? s?.def?.shape ?? {};
}

/** ZIP an `all` node's branch envelopes into ONE merged-object envelope — schema = the union of the branches' `z.object`
 *  fields (a key collision is a build-time error); value = `Object.assign` of each branch's rendered body over the tuple the
 *  fold produces. Doc-shape ≡ runtime-shape holds because both come from the SAME per-branch wraps. */
function mergeAllWrap(branches: readonly PlanNode[]): TerminalWrap {
  const terms = branches.map(terminalWrapOf);
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const t of terms) {
    for (const [key, sub] of Object.entries(objectShape(t.wrap.schema))) {
      if (key in shape) {
        throw new Error(`all(): two branches both produce the wire key "${key}" — rename one branch's envelope so the merged response body has distinct keys.`);
      }
      shape[key] = sub;
    }
  }
  const schema = z.object(shape) as unknown as z.ZodType<unknown>;
  const wrap: Envelope<unknown, unknown> = {
    schema,
    value: (domain: unknown) => {
      const parts = domain as unknown[];
      return Object.assign({}, ...terms.map((t, i) => t.wrap.value(parts[i])));
    },
  };
  const status = terms.find((t) => t.status !== undefined)?.status;
  return status !== undefined ? { wrap, status } : { wrap };
}

/** Build the composed Effect by folding the tree: `seq` threads outputs (flatMap), `all` tuples branches (Effect.all),
 *  `branch` picks an arm on the input. This is the RUNTIME analogue of the static contract fold. */
export function foldPlan(
  node: PlanNode,
  ctx: ActionCtx,
  input: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Effect.Effect<unknown, any, any> {
  switch (node.kind) {
    case "leaf":
      return node.action.run(ctx, input as never);
    case "seq": {
      let eff = foldPlan(node.steps[0], ctx, input);
      for (let i = 1; i < node.steps.length; i++) {
        const step = node.steps[i];
        eff = Effect.flatMap(eff, (prev) => foldPlan(step, ctx, prev));
      }
      return eff;
    }
    case "all":
      return Effect.all(node.branches.map((b) => foldPlan(b, ctx, input)));
    case "branch":
      return Effect.suspend(() => (node.pick(input) ? foldPlan(node.then, ctx, input) : foldPlan(node.else, ctx, input)));
  }
  throw new Error("foldPlan: unreachable node kind");
}

// ── CONSTRUCTORS ────────────────────────────────────────────────────────────────────────────────────────────────────────

const mkPipeline = <In, Dom, Err, R>(root: PlanNode): ActionPipeline<In, Dom, Err, R> => {
  const actions = leavesOf(root);
  return {
    [PIPELINE]: true,
    root,
    actions,
    head: entryLeafOf(root),
    terminal: actions[actions.length - 1],
    run: ((ctx: ActionCtx, input: In) => foldPlan(root, ctx, input)) as ActionPipeline<In, Dom, Err, R>["run"],
  };
};

const leaf = (action: AnyServiceAction): PlanNode => ({ kind: "leaf", action });

/** A step accepted by a combinator: a bare {@link ServiceAction} OR an already-composed {@link ActionPipeline} (this is what
 *  makes composition RECURSIVE — a pipeline is itself a valid child). */
export type Step<In, Dom, Err, R> = ServiceAction<In, Dom, Err, R> | ActionPipeline<In, Dom, Err, R>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStep = AnyServiceAction | ActionPipeline<any, any, any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPipeline = ActionPipeline<any, any, any, any>;

/** Domain-output / error / requirement of a step (action OR pipeline — same 4 type-param positions). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DomOf<X> = X extends ServiceAction<any, infer D, any, any> ? D : X extends ActionPipeline<any, infer D, any, any> ? D : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ErrOf<X> = X extends ServiceAction<any, any, infer E, any> ? E : X extends ActionPipeline<any, any, infer E, any> ? E : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReqOf<X> = X extends ServiceAction<any, any, any, infer R> ? R : X extends ActionPipeline<any, any, any, infer R> ? R : never;

/** Wrap an action or pipeline as a plan node — a pipeline contributes its whole `root` subtree (the recursion). */
const asNode = (x: AnyStep): PlanNode => (isPipeline(x) ? x.root : leaf(x as AnyServiceAction));

/** A single action → a 1-node pipeline (the 95% case) — Out/Err/R are exactly the action's. */
export function pipeline<In, Dom, Err, R>(a: ServiceAction<In, Dom, Err, R>): ActionPipeline<In, Dom, Err, R>;
/** TWO actions, fully TYPED — `b` consumes `a`'s domain output as its input; Err AND R union EXACTLY (so `effectPipeRoute`'s
 *  `provide` guard stays sound and a mis-threaded step is a compile error). */
export function pipeline<In, A, B, E1, E2, R1, R2>(
  a: ServiceAction<In, A, E1, R1>,
  b: ServiceAction<A, B, E2, R2>,
): ActionPipeline<In, B, E1 | E2, R1 | R2>;
/** THREE actions, fully TYPED (threaded + unioned). */
export function pipeline<In, A, B, C, E1, E2, E3, R1, R2, R3>(
  a: ServiceAction<In, A, E1, R1>,
  b: ServiceAction<A, B, E2, R2>,
  c: ServiceAction<B, C, E3, R3>,
): ActionPipeline<In, C, E1 | E2 | E3, R1 | R2 | R3>;
/** FOUR OR MORE actions — RUNTIME composition only; the step-to-step types AND R/Err degrade to `any` (an honest inference
 *  cliff → NO provide-safety). For >3 typed steps, nest: `chain(pipeline(a, b, c), d)`. The ≥4 arity keeps 2-3-step calls on
 *  the TYPED overloads above (a mis-typed short pipeline can't silently fall through to this `any` form). */
export function pipeline(
  a: AnyServiceAction, b: AnyServiceAction, c: AnyServiceAction, d: AnyServiceAction, ...rest: AnyServiceAction[]
): AnyPipeline;
export function pipeline(...actions: AnyServiceAction[]): AnyPipeline {
  return actions.length === 1
    ? mkPipeline(leaf(actions[0]))
    : mkPipeline({ kind: "seq", steps: actions.map(leaf) });
}

/**
 * TYPED 2-step composition — `next` consumes `first`'s DOMAIN output as its `input`; Err and R are unioned exactly. `first` may
 * be a pipeline (so `chain(chain(a, b), c)` nests for depth). This is the ONLY multi-step form we claim end-to-end typed.
 */
export function chain<In, A, B, E1, E2, R1, R2>(
  first: Step<In, A, E1, R1>,
  next: ServiceAction<A, B, E2, R2>,
): ActionPipeline<In, B, E1 | E2, R1 | R2> {
  return mkPipeline({ kind: "seq", steps: [asNode(first), leaf(next)] });
}

/**
 * SEQ — nestable sequential composition (the recursion-friendly `pipeline`): each step may be an action OR a pipeline, so a
 * whole subtree threads into the next. Typed for 2-3 steps (like `pipeline`); ≥4 or pipeline-steps past the head degrade to a
 * runtime walk (nest `chain` for full typing).
 */
export function seq<In, A, B, E1, E2, R1, R2>(
  a: Step<In, A, E1, R1>,
  b: Step<A, B, E2, R2>,
): ActionPipeline<In, B, E1 | E2, R1 | R2>;
export function seq<In, A, B, C, E1, E2, E3, R1, R2, R3>(
  a: Step<In, A, E1, R1>,
  b: Step<A, B, E2, R2>,
  c: Step<B, C, E3, R3>,
): ActionPipeline<In, C, E1 | E2 | E3, R1 | R2 | R3>;
export function seq(...steps: AnyStep[]): AnyPipeline;
export function seq(...steps: AnyStep[]): AnyPipeline {
  return mkPipeline({ kind: "seq", steps: steps.map(asNode) });
}

/**
 * ALL — fan out over the same input and TUPLE the branch outputs; the contract merges: `request` from the entry branch,
 * `ok.schema` = the branches' envelopes ZIPPED into one object (`{ todo, count }`), `errors` = the union of every branch,
 * `cost` = the SUM of every branch. Out is a position-preserving mapped tuple; Err/R union across branches (fully typed).
 */
export function all<T extends readonly AnyStep[]>(
  ...branches: T
): ActionPipeline<unknown, { [K in keyof T]: DomOf<T[K]> }, ErrOf<T[number]>, ReqOf<T[number]>>;
export function all(...branches: AnyStep[]): AnyPipeline {
  return mkPipeline({ kind: "all", branches: branches.map(asNode) });
}

/**
 * BRANCH — pick `thenStep` or `elseStep` on the input at runtime; the arms' Out/Err/R union. Both arms are DOCUMENTED (their
 * errors + costs bubble); the `then` arm supplies the response wire shape (arms should agree on it).
 */
export function branch<In, TB extends AnyStep, EB extends AnyStep>(
  pick: (input: In) => boolean,
  thenStep: TB,
  elseStep: EB,
): ActionPipeline<In, DomOf<TB> | DomOf<EB>, ErrOf<TB> | ErrOf<EB>, ReqOf<TB> | ReqOf<EB>>;
export function branch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pick: (input: any) => boolean,
  thenStep: AnyStep,
  elseStep: AnyStep,
): AnyPipeline {
  return mkPipeline({ kind: "branch", pick, then: asNode(thenStep), else: asNode(elseStep) });
}

/** The Effect requirement a pipeline still needs discharged (`Todo | Db` unions across actions) — used to TYPE `provide`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequirementOf<P> = P extends ActionPipeline<any, any, any, infer R> ? R : never;
/** The httpError-instance union a pipeline can fail with. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FailureOf<P> = P extends ActionPipeline<any, any, infer E, any> ? E : never;
