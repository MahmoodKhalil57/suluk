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
import type { SulukRateLimit } from "@suluk/core";
import { sumCost, type CostModel } from "@suluk/cost";
import type { RouteContract } from "@suluk/hono";
import { effectRoute, type EffectRoute, type Role } from "./route";
import { ValidationError } from "./common";
import type { AnyHttpError } from "./errors";
import type { ActionCtx } from "./action";
import { terminalWrapOf, type ActionPipeline, type RequirementOf } from "./pipeline";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPipeline = ActionPipeline<any, any, any, any>;

/** Methods whose effectRoute success-status default is a NO-BODY status (DELETE→204). A pipe-route always renders a wrap
 *  body, so for these we default the success status to 200 (see the walk) instead of letting 204 swallow the body. */
const NO_BODY_DEFAULT_METHOD: Record<string, true> = { delete: true };

export interface EffectPipeRouteSpec<P extends AnyPipeline, Roles extends readonly Role[]> {
  /** Optional — DEFAULTS from the entry op's `meta.method` (an `op()` carries its own operation identity). Required only
   *  when the entry is a bare `action()` with no meta. */
  method?: RouteContract["method"];
  /** Optional — DEFAULTS from the entry op's `meta.path`. */
  path?: string;
  name?: string;
  /** Optional — DEFAULTS from the entry op's `meta.summary`. */
  summary?: string;
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
  const { actions, root, head } = spec.pipeline;

  // ── RESOLVE the route IDENTITY — an explicit spec field wins, else the ENTRY op's `meta` (an op() defines its whole
  //    operation ONCE; the route just mounts it). method + path are required (from the spec OR the entry op). ─────────────
  const meta = head.meta ?? {};
  const method = spec.method ?? meta.method;
  const path = spec.path ?? meta.path;
  if (!method || !path) {
    throw new Error("effectPipeRoute: missing method/path — pass them in the spec, or make the entry an op() that carries method + path.");
  }
  const summary = spec.summary ?? meta.summary ?? "";
  const name = spec.name ?? meta.name;
  const roles = spec.roles ?? meta.roles;
  const tags = spec.tags ?? meta.tags;
  const description = spec.description ?? meta.description;
  const scope = spec.scope ?? meta.scope;
  const scopes = spec.scopes ?? meta.scopes;
  const internal = spec.internal ?? meta.internal;
  const validateBody = spec.validateBody ?? meta.validateBody;

  // ── FOLD the TREE (synchronous — no request, no layer, because every schema fact is a static property) ────────────────
  // (1) request.json ← the ENTRY leaf's `input` ONLY — the runtime feeds the request body to the entry leaf (a downstream
  //     action's `input` is a composition-typed value threaded from the previous step, NEVER an HTTP body). Explicit wins.
  const bodyAction = head.input ? head : undefined;
  const request: RouteContract["request"] | undefined =
    spec.request?.json || !bodyAction?.input ? spec.request : { ...spec.request, json: bodyAction.input };
  // (2) ok.schema ← the tree's TERMINAL wrap: a leaf's own `{ todo }`, a seq's last step, or an `all` node's branches ZIPPED
  //     into one merged body (`{ todo, count }`). status ← its override.
  const term = terminalWrapOf(root);
  const okSchema = term.wrap.schema as z.ZodTypeAny;
  // A pipe-route ALWAYS returns the terminal wrap body, so a no-body method default (DELETE→204) would silently DROP it +
  // document an illegal 204-with-body. When the terminal supplies no explicit status and the method's default is no-body,
  // use 200 instead (an explicit terminal status still wins; every other method keeps effectRoute's default via undefined).
  const okStatus = term.status ?? (NO_BODY_DEFAULT_METHOD[method] ? 200 : undefined);
  // (3) errors ← the deduped union of EVERY leaf's httpError classes (both arms of a `branch`; effectRoute adds 401/403).
  const seen = new Set<string>();
  const errors: AnyHttpError[] = [];
  for (const a of actions) for (const E of a.errors) if (!seen.has(E.errorTag)) { seen.add(E.errorTag); errors.push(E); }

  // (4) cost ← the SUM of every leaf's declared `cost` (the CostModel monoid): a route that composes N actions declares the
  //     SUM of their infra, not a hand-guess. Plus the single `worker.request` the one HTTP call always incurs. If NO leaf
  //     declares a cost, stay undefined so effectRoute derives its roles-default (byte-identical to a role-only route).
  const leafCosts = actions.map((a) => a.cost).filter((c): c is CostModel => c !== undefined);
  const summedCost: CostModel | undefined = leafCosts.length
    ? ((c) => ({ ...c, infra: { ...(c.infra ?? {}), "worker.request": 1 } }))(sumCost(leafCosts))
    : undefined;
  const cost = spec.cost ?? summedCost;

  // (5) rate-limit ← the TIGHTEST (smallest normalized rate) budget any leaf declares — calling the route once calls each leaf
  //     once, so a leaf's cap bounds the route (tightening, never loosening). The `key` is ROUTE-owned (from roles: an authed
  //     route keys on the principal, a public one on the IP). Explicit `spec.rateLimit` wins; no leaf budget → effectRoute default.
  const authed = (roles ?? []).some((r) => r === "signed-in" || r === "admin");
  const leafRls = actions.map((a) => a.rateLimit).filter((r): r is SulukRateLimit => r !== undefined);
  const tightest = leafRls.reduce<SulukRateLimit | undefined>(
    (best, r) => (!best || r.maxRequests / r.windowMs < best.maxRequests / best.windowMs ? r : best),
    undefined,
  );
  const rateLimit: RouteContract["rateLimit"] =
    spec.rateLimit ?? (tightest ? { ...tightest, key: authed ? "principal" : "ip" } : undefined);

  // ── DELEGATE to effectRoute: it derives scopes/cost/rate-limit/responses + renders success/typed-failure/500 exactly as
  //    today. We supply only the walked ok/request/errors + the synthesized `run` (compose → discharge R → wrap). ──────────
  return effectRoute({
    method,
    path,
    ...(name !== undefined ? { name } : {}),
    summary,
    ...(description !== undefined ? { description } : {}),
    ...(tags !== undefined ? { tags } : {}),
    ...(roles !== undefined ? { roles: roles as readonly Role[] } : {}),
    ...(scope !== undefined ? { scope } : {}),
    ...(scopes !== undefined ? { scopes } : {}),
    ...(spec.security !== undefined ? { security: spec.security } : {}),
    ...(rateLimit !== undefined ? { rateLimit } : {}),
    ...(cost !== undefined ? { cost } : {}),
    ...(internal !== undefined ? { internal } : {}),
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
          if (validateBody) {
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
        return term.wrap.value(domain);
      })) as never,
  });
}
