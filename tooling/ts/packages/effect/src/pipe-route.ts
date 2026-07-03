/**
 * effectPipeRoute — a route whose handler is an {@link ActionPipeline} of service actions, and whose v4 contract is WALKED off
 * the pipeline's action array instead of hand-spread. The walk:
 *   • `request.json`   ← the FIRST action carrying an `input` schema (an explicit `spec.request.json` still wins);
 *   • `ok.schema`      ← the TERMINAL action's `wrap.schema` (where the `{ todo }` / `{ todos }` envelope lives);
 *   • `ok.status`      ← the TERMINAL action's `status` (else effectRoute's method default);
 *   • `errors`         ← the deduped union of EVERY action's httpError classes (role-implied 401/403 added by effectRoute).
 *
 * It then DELEGATES to {@link effectRoute} (zero changes there) by handing it a synthesized `run` that: reads the body once
 * (opt-in typed-400 validation), composes the pipeline, discharges its requirement `R` via the route's typed `provide`, and
 * applies the terminal envelope to shape the wire body. So it inherits — byte-for-byte — effectRoute's roles→scope/cost/
 * rate-limit derivation, the 401 guard + `userId` injection, `schemaName` hoisting, description bubbling, and the render path.
 * Additive: `effectRoute`, `route.ts`, and `@suluk/hono` are untouched, so the function-`run` route files stay identical.
 */
import { Effect } from "effect";
import type { z } from "zod";
import type { Context } from "hono";
import type { RouteContract } from "@suluk/hono";
import { effectRoute, type EffectRoute, type Role } from "./route";
import { ValidationError } from "./common";
import type { AnyHttpError } from "./errors";
import type { ActionCtx } from "./action";
import type { ActionPipeline, RequirementOf } from "./pipeline";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPipeline = ActionPipeline<any, any, any, any>;

/** Methods whose effectRoute success-status default is a NO-BODY status (DELETE→204). A pipe-route always renders a wrap
 *  body, so for these we default the success status to 200 (see the walk) instead of letting 204 swallow the body. */
const NO_BODY_DEFAULT_METHOD: Record<string, true> = { delete: true };

export interface EffectPipeRouteSpec<P extends AnyPipeline, Roles extends readonly Role[]> {
  method: RouteContract["method"];
  path: string;
  name?: string;
  summary: string;
  description?: string;
  tags?: string[];
  roles?: Roles;
  scope?: string;
  scopes?: string[];
  security?: RouteContract["security"];
  rateLimit?: RouteContract["rateLimit"];
  cost?: RouteContract["cost"];
  internal?: boolean;
  /** params/query/header escape hatch — `request.json` is DERIVED from the head action's `input` (any explicit one wins). */
  request?: RouteContract["request"];
  /** The pipeline whose AST is walked for the contract and whose Effect is the handler. */
  pipeline: P;
  /**
   * Discharge the pipeline's remaining requirement (`Todo`, or a `Todo | …` union across actions) with the per-request env —
   * TYPED to the pipeline's exact `R` via {@link RequirementOf}, so a `provide` that discharges a NARROWER set than the
   * pipeline needs is a COMPILE error, not a runtime R-leak → 500. In the todo module this is EXACTLY today's
   * `program.pipe(Effect.provide(TodoLive), Effect.provide(DbLive(env)))`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provide: <A, E>(env: any, program: Effect.Effect<A, E, RequirementOf<P>>) => Effect.Effect<A, E, never>;
  /** Opt-in: validate the request body against the head action's `input` and fail with a typed 400 on mismatch. Default OFF,
   *  so a route that doesn't set it passes the raw body through (as the hand-written handlers did). */
  validateBody?: boolean;
}

export function effectPipeRoute<P extends AnyPipeline, const Roles extends readonly Role[] = readonly []>(
  spec: EffectPipeRouteSpec<P, Roles>,
): EffectRoute {
  const { actions, terminal, head } = spec.pipeline;

  // ── WALK the AST (synchronous — no request, no layer, because every schema fact is a static property) ──────────────────
  // (1) request.json ← the HEAD action's `input` ONLY — the runtime feeds the request body to `head.run` (a downstream
  //     action's `input` is a composition-typed value threaded from the previous step, NEVER an HTTP body). Explicit wins.
  const bodyAction = head.input ? head : undefined;
  const request: RouteContract["request"] | undefined =
    spec.request?.json || !bodyAction?.input ? spec.request : { ...spec.request, json: bodyAction.input };
  // (2) ok.schema ← the terminal action's envelope schema (the `{ todo }` wrap); status ← its override.
  const okSchema = terminal.wrap.schema as z.ZodTypeAny;
  // A pipe-route ALWAYS returns the terminal's wrap body, so a no-body method default (DELETE→204) would silently DROP it +
  // document an illegal 204-with-body. When the terminal supplies no explicit status and the method's default is no-body,
  // use 200 instead (an explicit `terminal.status` still wins; every other method keeps effectRoute's default via undefined).
  const okStatus = terminal.status ?? (NO_BODY_DEFAULT_METHOD[spec.method] ? 200 : undefined);
  // (3) errors ← the deduped union of every action's httpError classes (effectRoute adds the role-implied 401/403).
  const seen = new Set<string>();
  const errors: AnyHttpError[] = [];
  for (const a of actions) for (const E of a.errors) if (!seen.has(E.errorTag)) { seen.add(E.errorTag); errors.push(E); }

  // ── DELEGATE to effectRoute: it derives scopes/cost/rate-limit/responses + renders success/typed-failure/500 exactly as
  //    today. We supply only the walked ok/request/errors + the synthesized `run` (compose → discharge R → wrap). ──────────
  return effectRoute({
    method: spec.method,
    path: spec.path,
    ...(spec.name !== undefined ? { name: spec.name } : {}),
    summary: spec.summary,
    ...(spec.description !== undefined ? { description: spec.description } : {}),
    ...(spec.tags !== undefined ? { tags: spec.tags } : {}),
    ...(spec.roles !== undefined ? { roles: spec.roles } : {}),
    ...(spec.scope !== undefined ? { scope: spec.scope } : {}),
    ...(spec.scopes !== undefined ? { scopes: spec.scopes } : {}),
    ...(spec.security !== undefined ? { security: spec.security } : {}),
    ...(spec.rateLimit !== undefined ? { rateLimit: spec.rateLimit } : {}),
    ...(spec.cost !== undefined ? { cost: spec.cost } : {}),
    ...(spec.internal !== undefined ? { internal: spec.internal } : {}),
    ...(request !== undefined ? { request } : {}),
    ok: { schema: okSchema, ...(okStatus !== undefined ? { status: okStatus } : {}) },
    errors: errors as unknown as readonly AnyHttpError[],
    // The synthesized handler Effect. effectRoute injects the guaranteed `{ userId }` and renders the returned value.
    run: ((c: Context, auth: { userId?: string }) =>
      Effect.gen(function* () {
        const ctx: ActionCtx = { c, userId: auth.userId ?? "", param: (n) => c.req.param(n) };
        // read the body ONCE iff the head declares an input. Opt-in validation → a typed 400 (never a 500 defect).
        let input: unknown = undefined;
        if (bodyAction?.input) {
          const raw = (yield* Effect.promise(() => c.req.json().catch(() => ({})))) as unknown;
          if (spec.validateBody) {
            const parsed = bodyAction.input.safeParse(raw);
            if (!parsed.success) return yield* new ValidationError({ issues: parsed.error.issues.map((i) => i.message) });
            input = parsed.data;
          } else {
            input = raw;
          }
        }
        // compose → discharge R with the real per-request env → apply the terminal wrap to shape the wire body.
        const program = spec.pipeline.run(ctx, input);
        const domain = yield* spec.provide(c.env, program);
        return terminal.wrap.value(domain);
      })) as never,
  });
}
