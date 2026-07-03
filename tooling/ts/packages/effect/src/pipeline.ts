/**
 * An ACTION PIPELINE — the walkable AST (`actions`, an ordered array) plus the composed Effect. A route's `run` is one of
 * these: {@link effectPipeRoute} walks `actions` to derive the whole contract (request ← head's `input`; response ← terminal's
 * `wrap`; errors ← the union of every action's `errors`). The COMMON case is one action; `chain(a, b)` gives a TYPED 2-step
 * composition (the next action consumes the previous domain output, Err/R unioned). 3+ steps run correctly via the variadic
 * `pipeline(...)`, but their step-to-step TYPES degrade to `any` — an honest inference cliff (nest `chain` for >2 typed steps).
 */
import { Effect } from "effect";
import type { ActionCtx, AnyServiceAction, ServiceAction } from "./action";

const PIPELINE = Symbol.for("@suluk/effect/pipeline");

export interface ActionPipeline<In, Dom, Err, R> {
  readonly [PIPELINE]: true;
  /** THE AST — the ordered actions, walked by effectPipeRoute to collect request/ok/errors/status (a runtime walk; no request,
   *  no layer, because every schema fact is a static property on each action). */
  readonly actions: readonly AnyServiceAction[];
  /** the composed Effect: runs the actions head→tail, threading each domain output into the next as its `input`. */
  readonly run: (ctx: ActionCtx, input: In) => Effect.Effect<Dom, Err, R>;
  /** the HEAD action — the source of `request.json`. */
  readonly head: AnyServiceAction;
  /** the TERMINAL action — the source of `ok.schema` (its `wrap.schema`), `status`, and the render-time wrap. */
  readonly terminal: AnyServiceAction;
}

/** Type guard — is `v` an {@link ActionPipeline}? */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPipeline = (v: unknown): v is ActionPipeline<any, any, any, any> =>
  typeof v === "object" && v !== null && (v as Record<symbol, unknown>)[PIPELINE] === true;

const mkPipeline = <In, Dom, Err, R>(
  actions: readonly AnyServiceAction[],
  run: (ctx: ActionCtx, input: In) => Effect.Effect<Dom, Err, R>,
): ActionPipeline<In, Dom, Err, R> => ({
  [PIPELINE]: true,
  actions,
  run,
  head: actions[0],
  terminal: actions[actions.length - 1],
});

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ActionPipeline<any, any, any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pipeline(...actions: AnyServiceAction[]): ActionPipeline<any, any, any, any> {
  const [head] = actions;
  return mkPipeline(actions, (ctx, input) =>
    actions.slice(1).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (eff, act) => Effect.flatMap(eff, (prev) => act.run(ctx, prev as never)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      head.run(ctx, input as never) as Effect.Effect<any, any, any>,
    ),
  );
}

/**
 * TYPED 2-step composition — `next` consumes `first`'s DOMAIN output as its `input`; Err and R are unioned exactly (Effect
 * unions them at runtime; the generic mirrors it). Nest for more: `chain(chain(a, b), c)`. This is the ONLY multi-step form
 * we claim end-to-end typed.
 */
export function chain<In, A, B, E1, E2, R1, R2>(
  first: ServiceAction<In, A, E1, R1> | ActionPipeline<In, A, E1, R1>,
  next: ServiceAction<A, B, E2, R2>,
): ActionPipeline<In, B, E1 | E2, R1 | R2> {
  const head: ActionPipeline<In, A, E1, R1> = isPipeline(first) ? first : pipeline(first as ServiceAction<In, A, E1, R1>);
  const actions = [...head.actions, next] as readonly AnyServiceAction[];
  return mkPipeline(actions, (ctx, input) => Effect.flatMap(head.run(ctx, input), (prev) => next.run(ctx, prev)));
}

/** The Effect requirement a pipeline still needs discharged (`Todo | Db` unions across actions) — used to TYPE `provide`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequirementOf<P> = P extends ActionPipeline<any, any, any, infer R> ? R : never;
/** The httpError-instance union a pipeline can fail with. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FailureOf<P> = P extends ActionPipeline<any, any, infer E, any> ? E : never;
