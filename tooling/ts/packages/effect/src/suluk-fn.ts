/**
 * A SULUK FUNCTION — the composable unit for the Suluk v4 contract, the way `Effect` is Effect-TS's composable unit. Each
 * `sulukFn` carries a SLICE of the core v4 {@link Request} (packages/core/src/types.ts) — authored with ZOD — fused with an
 * Effect impl. You maintain ONE surface (the `Request` fields: method / body / params / responses / errors / cost / …); every
 * other split is just HOW you compose these functions.
 *
 * COMPOSITION IS BUBBLING. Every layer — MODEL, SERVICE, ROUTE — is a `sulukFn`, and {@link sulukFmt} RUNS+FORMATS a layer over
 * the one below (a service `sulukFmt`s its models; a route `sulukFmt`s its services). Because every fact lives on the leaf MODEL,
 * the whole `Request` accretes upward with nothing restated:
 *   • `cost`    ← DEFINED ON THE MODEL; SUMmed up the tree (the CostModel monoid) — a service/route hand-declares none.
 *   • `errors`  ← the UNION of every layer (a model declares `errors:[NotFoundError]` ONCE; it bubbles up every layer WITHOUT
 *                 re-declaration — run channels stay permissive, like {@link effectRoute}).
 *   • response  ← the model's `ok.schema` (`wireDto(table.zodSchema)` — the db schema IS the response type); the route's `view`
 *                 WRAPS it into the wire body (`{ todo }`). `rateLimit` ← the TIGHTEST; scalars lead from the outermost layer.
 * This connects the STATE SOURCE (drizzle, in the model's query + schema) to the HOST + API REFERENCE (hono, via {@link sulukRoute},
 * which projects the merged slice onto {@link effectRoute} — inheriting the scope/cost/rate-limit derivation, the 401 guard +
 * `userId` injection, the typed-error rendering, and the emitV4 doc). Any split — controller→service→model or otherwise — is just
 * how you `sulukFmt`; nothing hardcodes the layers.
 *
 *   // MODEL — the db query + the state-source facts (schema, cost, by-id error) on its slice
 *   const findTodo   = sulukFn({ cost: readCost, errors: [NotFoundError], ok: { schema: wireDto(todo.zodSchema) },
 *                                run: (ctx, id: string) => Effect.flatMap(Db, (db) => …) });
 *   const getTodoSvc = sulukFmt(findTodo);                                        // SERVICE — runs+formats the model(s)
 *   const getTodo    = sulukFmt(                                                  // ROUTE — runs+formats the service(s) + HTTP/view
 *     sulukFn({ method: "get", path: "/api/todos/:id", roles: ["signed-in"], summary: "…", view: view("todo"),
 *               run: (ctx) => Effect.succeed(ctx.param("id")!) }),                //   controller: HTTP identity + extract the id
 *     getTodoSvc);
 *   todos.route(sulukRoute(getTodo, { provide }));                               // hono host + the api reference, whole
 */
import { Effect } from "effect";
import { z } from "zod";
import type { Cause as CauseT } from "effect";
import type { Context } from "hono";
import { sumCost, type CostModel } from "@suluk/cost";
import type { SulukRateLimit, SulukSource } from "@suluk/core";
import type { RouteContract, ScenarioStep } from "@suluk/hono";
import { envelope, listEnvelope, type ActionCtx, type Envelope } from "./envelope";
import { effectRoute, type EffectRoute, type Role } from "./route";
import { ValidationError } from "./common";
import type { AnyHttpError } from "./errors";

const SULUK = Symbol.for("@suluk/effect/suluk-fn");

/** Methods whose effectRoute success-status default is a NO-BODY status (DELETE→204). A suluk route that returns a wire body
 *  on such a method defaults to 200 instead, so the body isn't silently dropped (e.g. a delete returning `{ deleted: true }`). */
const NO_BODY_DEFAULT_METHOD: Record<string, true> = { delete: true };

/** Any yieldable, tagged {@link httpError} instance — a suluk function's run channel accepts ALL of them (its own declared
 *  errors OR one a lower layer fails with), so a leaf's error BUBBLES UP through every layer above without re-declaration.
 *  effectRoute renders any tagged one off its own class; the `errors` SLICE (not the channel) is what documents them. */
type AnyHttpErrorInstance = CauseT.YieldableError & { readonly _tag: string };

/**
 * A VIEW — a pending response envelope keyed but not yet bound to a domain schema (`view("todo")`). At the route boundary it
 * WRAPS whatever domain schema bubbled up into the wire body `{ todo: <domain> }`, so the wrap key lives with the controller
 * while the wrapped schema comes from the model — the two provably agree (both are the SAME {@link envelope}).
 */
export type View = (domainSchema: z.ZodTypeAny) => Envelope<unknown, unknown>;

/** Build a {@link View} — wrap the bubbled-up domain schema as `{ key: <domain> }` (a single entity). */
export function view<K extends string>(key: K, opts?: { describe?: string }): View {
  return ((domainSchema: z.ZodType<unknown>) => envelope(key, domainSchema, opts)) as View;
}

/** Build a LIST {@link View} — wrap the bubbled-up ITEM schema as `{ key: <item>[] }` (a collection of the model's entity),
 *  so a list endpoint reuses the SAME model schema the single-entity one does, only arrayed. */
export function listView<K extends string>(key: K, opts?: { describe?: string }): View {
  return ((itemSchema: z.ZodType<unknown>) => listEnvelope(key, itemSchema, opts)) as View;
}

/**
 * A SLICE of the core v4 {@link Request} — the ONE surface a suluk function maintains, authored with zod. Every field maps to a
 * `Request` member (`body`→`contentSchema`, `ok`→a 2xx response, `errors`→typed 4xx/5xx, `cost`→`x-suluk-cost`, …). A function
 * declares only the fields it OWNS; the rest bubble up when {@link sulukFmt} merges the pipeline's slices.
 */
export interface RequestSlice {
  method?: RouteContract["method"];
  path?: string;
  name?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  roles?: readonly Role[];
  scope?: string;
  scopes?: string[];
  internal?: boolean;
  /** → the request body schema (`Request.contentSchema` / `request.json`). */
  body?: z.ZodTypeAny;
  /** → `Request.parameterSchema.query`. (Path params AUTO-derive from the path template's `:name`.) */
  query?: z.ZodTypeAny;
  /** validate the body against `body` and fail with a typed 400 (else pass the raw body through). */
  validateBody?: boolean;
  /** → the SUCCESS response (`Request.responses[2xx]`): the DOMAIN schema the handler yields (a `view` wraps it) + status. */
  ok?: { status?: number; schema?: z.ZodTypeAny; description?: string };
  /** the wrapper applied to the effective `ok.schema` to produce the wire body (`{ todo }`) — set by the outermost layer. */
  view?: View;
  /** → typed error responses (`Request.responses[4xx/5xx]`): the httpError CLASSES. UNIONed up the tree. */
  errors?: readonly AnyHttpError[];
  /** → `x-suluk-cost`: this layer's infra/components; SUMmed up the tree (the CostModel monoid). */
  cost?: CostModel;
  /** → `x-suluk-ratelimit`: the route takes the TIGHTEST budget any layer declares. */
  rateLimit?: SulukRateLimit;
  /** → `x-suluk-source`: provenance to the state source (e.g. the drizzle table a model sulukFn queries). */
  source?: SulukSource;
  /** → `x-suluk-scenario`: the authored BDD steps (Given/When/Then phrases). ACCUMULATED up the tree (concat + dedup, like
   *  `errors` union — NOT inherit) so a route's merged slice holds the whole pipeline's steps; @suluk/journeys reads them. */
  steps?: readonly ScenarioStep[];
  security?: RouteContract["security"];
}

/** Anything that carries a {@link RequestSlice} — every {@link SulukFn} is one; {@link sulukFmt} merges their slices. */
export interface SliceProvider {
  readonly slice: RequestSlice;
}

/**
 * A SULUK FUNCTION — `In` the run's input, `Out` its domain result (INFERRED from the Effect), `R` the undischarged Effect
 * requirement (`Db`/a service tag), settled at the route via `provide`. `slice` is this fn's own contract contribution; a
 * pipeline's merged slice comes from {@link sulukFmt}.
 */
export interface SulukFn<In, Out, R> extends SliceProvider {
  readonly [SULUK]: true;
  readonly slice: RequestSlice;
  /** the Effect impl. {@link sulukFmt} threads it in a pipeline (`fns[i].run(ctx, prevOut)`); a leaf just runs. */
  readonly run: (ctx: ActionCtx, input: In) => Effect.Effect<Out, AnyHttpErrorInstance, R>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySulukFn = SulukFn<any, any, any>;

/** Type guard — is `v` a {@link SulukFn}? */
export const isSulukFn = (v: unknown): v is AnySulukFn =>
  typeof v === "object" && v !== null && (v as Record<symbol, unknown>)[SULUK] === true;

// A MODEL is just a {@link sulukFn} too — the leaf that runs the db query and carries the STATE-SOURCE facts on its slice: the
// entity `ok.schema` (`wireDto(table.zodSchema)` — the db schema IS the response type, with its constraints + `$ref` provenance),
// its `cost` (defined HERE, so it bubbles up), and any by-id `errors` ([NotFoundError]). A SERVICE `sulukFmt`s models; a ROUTE
// `sulukFmt`s services. So there is no separate model primitive — models, services, routes are all sulukFns, and {@link sulukFmt}
// runs+formats each layer over the one below.

// ── SLICE MERGE (the bubbling) ──────────────────────────────────────────────────────────────────────────────────────────

/** own field wins; else the first dep that declares it (deps are already-merged, so this is one level). */
function inherit<T>(own: T | undefined, deps: readonly RequestSlice[], pick: (s: RequestSlice) => T | undefined): T | undefined {
  if (own !== undefined) return own;
  for (const d of deps) { const v = pick(d); if (v !== undefined) return v; }
  return undefined;
}

/** MERGE a function's own slice OVER its dependencies' slices — the bubble. Scalars inherit; `errors` UNION; `cost` SUM;
 *  `rateLimit` tightens; `ok`/`view`/`source` inherit. So the outermost function's slice is the WHOLE `Request`. */
function mergeSlices(own: RequestSlice, deps: readonly RequestSlice[]): RequestSlice {
  const all = [own, ...deps];
  // errors ← deduped union across every layer.
  const seen = new Set<string>();
  const errors: AnyHttpError[] = [];
  for (const s of all) for (const E of s.errors ?? []) if (!seen.has(E.errorTag)) { seen.add(E.errorTag); errors.push(E); }
  // cost ← the SUM of every layer's declared cost (the CostModel monoid).
  const costs = all.map((s) => s.cost).filter((c): c is CostModel => c !== undefined);
  const cost = costs.length ? sumCost(costs) : undefined;
  // rate-limit ← the TIGHTEST (smallest normalized rate) any layer declares.
  const rls = all.map((s) => s.rateLimit).filter((r): r is SulukRateLimit => r !== undefined);
  const rateLimit = rls.reduce<SulukRateLimit | undefined>(
    (best, r) => (!best || r.maxRequests / r.windowMs < best.maxRequests / best.windowMs ? r : best),
    undefined,
  );
  // BDD steps ← the CONCAT of every layer's authored steps (accumulate like errors, NOT inherit), deduped by role+text so a
  //             model's Given reused across a fan-out appears once. Role-order is applied downstream (journeys sorts G<W<T).
  const steps = dedupeSteps(all.flatMap((s) => s.steps ?? []));
  const merged: RequestSlice = {
    method: inherit(own.method, deps, (s) => s.method),
    path: inherit(own.path, deps, (s) => s.path),
    name: inherit(own.name, deps, (s) => s.name),
    summary: inherit(own.summary, deps, (s) => s.summary),
    description: inherit(own.description, deps, (s) => s.description),
    tags: inherit(own.tags, deps, (s) => s.tags),
    roles: inherit(own.roles, deps, (s) => s.roles),
    scope: inherit(own.scope, deps, (s) => s.scope),
    scopes: inherit(own.scopes, deps, (s) => s.scopes),
    internal: inherit(own.internal, deps, (s) => s.internal),
    body: inherit(own.body, deps, (s) => s.body),
    query: inherit(own.query, deps, (s) => s.query),
    validateBody: inherit(own.validateBody, deps, (s) => s.validateBody),
    ok: inherit(own.ok, deps, (s) => s.ok),
    view: inherit(own.view, deps, (s) => s.view),
    source: inherit(own.source, deps, (s) => s.source),
    security: inherit(own.security, deps, (s) => s.security),
    ...(errors.length ? { errors } : {}),
    ...(cost ? { cost } : {}),
    ...(rateLimit ? { rateLimit } : {}),
    ...(steps.length ? { steps } : {}),
  };
  // drop undefined keys so the slice stays a clean, inspectable surface.
  return Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined)) as RequestSlice;
}

/** dedupe authored steps by role+text (a model's Given reused across a fan-out, or the auth Given, collapses to one). */
function dedupeSteps(steps: readonly ScenarioStep[]): ScenarioStep[] {
  const seen = new Set<string>();
  const out: ScenarioStep[] = [];
  for (const st of steps) { const k = `${st.role}::${st.text}`; if (!seen.has(k)) { seen.add(k); out.push(st); } }
  return out;
}

// ── THE CONSTRUCTOR ─────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Author a {@link SulukFn} — a LEAF: its own contract slice + `run`. It composes with OTHER sulukFns only through {@link sulukFmt}
 * (linear pipeline) / {@link sulukFmt.all} (fan-out); there is no in-constructor `deps` — a layer never reaches into another. `Out`
 * is INFERRED from the Effect. The run channel is PERMISSIVE (any tagged httpError) so a pipeline may run a lower fn that fails
 * without re-declaring the error — `errors` only DOCUMENTS this fn's own new failure modes, and every fn's errors bubble via the
 * merge. `Errs` types this fn's own declared throws.
 */
export function sulukFn<
  In = void,
  Out = unknown,
  R = never,
  const Errs extends readonly AnyHttpError[] = readonly [],
>(def: {
  method?: RouteContract["method"];
  path?: string;
  name?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  roles?: readonly Role[];
  scope?: string;
  scopes?: string[];
  internal?: boolean;
  body?: z.ZodType<In>;
  query?: z.ZodTypeAny;
  validateBody?: boolean;
  /** the response schema BEFORE any `view` wrapping — a model's ENTITY schema. Decoupled from `Out`: a list model returns
   *  `Out = Item[]` but its `ok.schema` is the `Item` (a `listView` arrays it), so this is `z.ZodTypeAny`, not `z.ZodType<Out>`. */
  ok?: { status?: number; schema?: z.ZodTypeAny; description?: string };
  view?: View;
  errors?: Errs;
  cost?: CostModel;
  rateLimit?: SulukRateLimit;
  source?: SulukSource;
  security?: RouteContract["security"];
  /** the authored BDD step(s) this fn contributes — a MODEL its `given` precondition, a CONTROLLER its `when` action, either
   *  an outcome `then`. Accumulated up the pipeline by {@link sulukFmt}; drives @suluk/journeys's generated scenario. */
  step?: ScenarioStep | readonly ScenarioStep[];
  run: (ctx: ActionCtx, input: In) => Effect.Effect<Out, InstanceType<Errs[number]> | AnyHttpErrorInstance, R>;
}): SulukFn<In, Out, R> {
  const own: RequestSlice = {
    method: def.method, path: def.path, name: def.name, summary: def.summary, description: def.description,
    tags: def.tags, roles: def.roles, scope: def.scope, scopes: def.scopes, internal: def.internal,
    body: def.body, query: def.query, validateBody: def.validateBody, ok: def.ok, view: def.view,
    errors: def.errors, cost: def.cost, rateLimit: def.rateLimit, source: def.source, security: def.security,
    steps: def.step ? (Array.isArray(def.step) ? def.step : [def.step]) : undefined,
  };
  const slice = mergeSlices(own, []); // normalize (drop undefined keys) — nothing to bubble; sulukFmt does the composing.
  // every declared error is a yieldable httpError, so widening the run's channel to `AnyHttpErrorInstance` is sound (the extra
  // member `InstanceType<Errs[number]>` is only nominally distinct from `YieldableError` at the type level).
  const run = def.run as SulukFn<In, Out, R>["run"];
  return { [SULUK]: true, slice, run };
}

// ── THE PIPELINE FORMATTER ──────────────────────────────────────────────────────────────────────────────────────────────

/**
 * `sulukFmt` — RUN a pipeline of {@link sulukFn}s and FORMAT (merge) their slices into one. This is how a layer composes the one
 * below it: a SERVICE `sulukFmt`s its MODELS, a ROUTE `sulukFmt`s its SERVICES — and because every fact (schema / cost / errors)
 * lives on the leaf model, it BUBBLES up through every layer, so a service/route hand-declares NONE of them.
 *   • RUN — the fns thread left→right: `fns[0].run(ctx, input)` → `fns[1].run(ctx, out0)` → … The terminal fn's output is the
 *     response domain (a route's `view` wraps it). A single-fn pipeline is just that fn, run.
 *   • FORMAT — every fn's slice MERGES (errors UNION, cost SUM, rate-limit tightest, response schema + scalars inherit). The
 *     FIRST fn's scalars win (so a route's controller — its `method`/`path`/`view` — leads; the model's `ok`/`cost`/`errors`
 *     follow). Define costs in the model and they SUM up the tree here with nothing restated.
 * Returns a {@link SulukFn}, so pipelines nest (a route is `sulukFmt(controller, service)` where `service = sulukFmt(model)`).
 */
export function sulukFmt<In, Out, R>(a: SulukFn<In, Out, R>): SulukFn<In, Out, R>;
export function sulukFmt<In, A, Out, R1, R2>(a: SulukFn<In, A, R1>, b: SulukFn<A, Out, R2>): SulukFn<In, Out, R1 | R2>;
export function sulukFmt<In, A, B, Out, R1, R2, R3>(a: SulukFn<In, A, R1>, b: SulukFn<A, B, R2>, c: SulukFn<B, Out, R3>): SulukFn<In, Out, R1 | R2 | R3>;
export function sulukFmt(...fns: AnySulukFn[]): AnySulukFn;
export function sulukFmt(...fns: AnySulukFn[]): AnySulukFn {
  if (fns.length === 0) throw new Error("sulukFmt: needs at least one sulukFn to run + format.");
  const slice = fns.reduce<RequestSlice>((acc, f) => mergeSlices(acc, [f.slice]), {});
  const run = ((ctx: ActionCtx, input: unknown) => {
    let eff = fns[0].run(ctx, input as never);
    for (let i = 1; i < fns.length; i++) {
      const next = fns[i];
      eff = Effect.flatMap(eff, (out) => next.run(ctx, out as never));
    }
    return eff;
  }) as AnySulukFn["run"];
  return { [SULUK]: true, slice, run };
}

/** the domain output of a sulukFn — for typing the fan-out's keyed body. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OutOf<Fn> = Fn extends SulukFn<any, infer O, any> ? O : never;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace sulukFmt {
  /**
   * `sulukFmt.all` — FAN OUT: run every branch on the SAME input, then FORMAT their keyed outputs into ONE body. Where
   * {@link sulukFmt} is a linear pipeline (thread output→input), this is the parallel merge — the second combinator so any
   * composition is a sulukFmt, never `deps`. Each branch's `ok.schema` becomes a property of the merged response schema
   * (`{ todo: TodoItem, count: number }`), so the composite body is DERIVED, never restated. errors UNION, cost SUM across branches.
   *
   *   sulukFmt.all({ todo: getTodo, count: countTodos })   // → { todo, count }; schema + errors + cost all bubble
   */
  export function all<T extends Record<string, AnySulukFn>>(
    branches: T,
  ): SulukFn<unknown, { [K in keyof T]: OutOf<T[K]> }, ReqOf<T[keyof T]>> {
    const entries = Object.entries(branches);
    const okShape: Record<string, z.ZodTypeAny> = {};
    const seen = new Set<string>();
    const errors: AnyHttpError[] = [];
    const costs: CostModel[] = [];
    const allSteps: ScenarioStep[] = [];
    for (const [key, fn] of entries) {
      const s = fn.slice;
      if (s.ok?.schema) okShape[key] = s.ok.schema as z.ZodTypeAny;
      for (const E of s.errors ?? []) if (!seen.has(E.errorTag)) { seen.add(E.errorTag); errors.push(E); }
      if (s.cost) costs.push(s.cost);
      allSteps.push(...(s.steps ?? []));
    }
    const steps = dedupeSteps(allSteps);
    const slice: RequestSlice = {
      ok: { schema: z.object(okShape) },
      ...(errors.length ? { errors } : {}),
      ...(costs.length ? { cost: sumCost(costs) } : {}),
      ...(steps.length ? { steps } : {}),
    };
    const run = ((ctx: ActionCtx, input: unknown) =>
      Effect.map(
        Effect.all(entries.map(([, fn]) => fn.run(ctx, input as never))),
        (outs) => Object.fromEntries(entries.map(([key], i) => [key, (outs as unknown[])[i]])),
      )) as AnySulukFn["run"];
    return { [SULUK]: true, slice, run } as SulukFn<unknown, { [K in keyof T]: OutOf<T[K]> }, ReqOf<T[keyof T]>>;
  }
}

// ── THE HOST + API-REFERENCE BRIDGE ─────────────────────────────────────────────────────────────────────────────────────

export interface SulukRouteSpec<Fn extends AnySulukFn> {
  /**
   * Discharge the function's remaining Effect requirement `R` (its service tag / `Db`) with the per-request env — TYPED to the
   * fn's exact `R`, so a `provide` that discharges too little is a COMPILE error (never a runtime R-leak → 500).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provide: <A, E>(env: any, program: Effect.Effect<A, E, ReqOf<Fn>>) => Effect.Effect<A, E, never>;
  /** Any explicit override of the bubbled slice (method/path/summary/roles/…). */
  method?: RouteContract["method"];
  path?: string;
  summary?: string;
  name?: string;
  roles?: readonly Role[];
}

/** The Effect requirement a suluk function still needs discharged — used to TYPE `provide`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReqOf<Fn> = Fn extends SulukFn<any, any, infer R> ? R : never;

/**
 * Mount a suluk function as a v4 route — project its fully-merged {@link RequestSlice} onto {@link effectRoute} so the HOST
 * (the hono handler) and the API REFERENCE (the derived `DocumentedRoute` → emitV4) come from ONE surface. Everything effectRoute
 * derives — scopes, default cost/rate-limit, the 401 guard + `userId` injection, one typed response per bubbled error, the
 * render — is inherited unchanged; this only supplies the walked ok/request/errors + the synthesized run (read body → run →
 * discharge R → wrap with the view).
 */
export function sulukRoute<Fn extends AnySulukFn>(fn: Fn, spec: SulukRouteSpec<Fn>): EffectRoute {
  const s = fn.slice;
  const method = spec.method ?? s.method;
  const path = spec.path ?? s.path;
  if (!method || !path) {
    throw new Error("sulukRoute: missing method/path — declare them on the outermost sulukFn, or pass them here.");
  }
  const roles = spec.roles ?? s.roles;

  // response: the bubbled DOMAIN schema, WRAPPED by the view (if any) into the wire body. Doc-shape ≡ render-shape (same view).
  const domainSchema = s.ok?.schema;
  const viewed = s.view ? s.view(domainSchema ?? z.unknown()) : undefined;
  const okSchema = (viewed ? viewed.schema : domainSchema) as z.ZodTypeAny | undefined;
  // a body on a no-body-default method (DELETE→204) would be dropped; default it to 200 (an explicit status still wins).
  const okStatus = s.ok?.status ?? (okSchema && NO_BODY_DEFAULT_METHOD[method] ? 200 : undefined);

  // request: body → request.json, query → request.query (path params auto-derive from the path template).
  const request: RouteContract["request"] | undefined =
    s.body || s.query ? { ...(s.body ? { json: s.body } : {}), ...(s.query ? { query: s.query } : {}) } : undefined;

  // cost ← the bubbled SUM + the one worker.request every HTTP call always incurs.
  const cost: RouteContract["cost"] | undefined = s.cost
    ? { ...s.cost, infra: { ...(s.cost.infra ?? {}), "worker.request": 1 } }
    : undefined;
  // rate-limit ← the bubbled tightest budget, keyed by the roles (authed → principal, else ip).
  const authed = (roles ?? []).some((r) => r === "signed-in" || r === "admin");
  const rateLimit: RouteContract["rateLimit"] | undefined = s.rateLimit ? { ...s.rateLimit, key: authed ? "principal" : "ip" } : undefined;
  // scenario ← the bubbled authored steps, with the auth `Given` DERIVED from roles (so journeys needs no toolfactory-stamped
  //            x-suluk-access) prepended + deduped. This is the whole ordered G/W/T the pipeline authored.
  const authGiven: ScenarioStep[] = authed ? [{ role: "given", text: "I am a signed-in user" }] : [];
  const scenario = dedupeSteps([...authGiven, ...(s.steps ?? [])]);

  return effectRoute({
    method,
    path,
    ...(spec.name ?? s.name ? { name: spec.name ?? s.name } : {}),
    summary: spec.summary ?? s.summary ?? "",
    ...(s.description !== undefined ? { description: s.description } : {}),
    ...(s.tags !== undefined ? { tags: s.tags } : {}),
    ...(roles !== undefined ? { roles: roles as readonly Role[] } : {}),
    ...(s.scope !== undefined ? { scope: s.scope } : {}),
    ...(s.scopes !== undefined ? { scopes: s.scopes } : {}),
    ...(s.security !== undefined ? { security: s.security } : {}),
    ...(rateLimit !== undefined ? { rateLimit } : {}),
    ...(cost !== undefined ? { cost } : {}),
    ...(s.internal !== undefined ? { internal: s.internal } : {}),
    ...(request !== undefined ? { request } : {}),
    ...(scenario.length ? { scenario } : {}),
    ok: { ...(okSchema ? { schema: okSchema } : {}), ...(okStatus !== undefined ? { status: okStatus } : {}), ...(s.ok?.description ? { description: s.ok.description } : {}) },
    errors: (s.errors ?? []) as unknown as readonly AnyHttpError[],
    // The synthesized handler: build the ctx, read the body once (opt-in typed-400 validation), run the function, discharge its
    // requirement with the real env, and apply the view to shape the wire body.
    run: ((c: Context, auth: { userId?: string }) =>
      Effect.gen(function* () {
        const ctx: ActionCtx = { c, userId: auth.userId ?? "", param: (n) => c.req.param(n) };
        let input: unknown = undefined;
        if (s.body) {
          const raw = (yield* Effect.promise(() => c.req.json().catch(() => ({})))) as unknown;
          if (s.validateBody) {
            const parsed = s.body.safeParse(raw);
            if (!parsed.success) return yield* new ValidationError({ issues: parsed.error.issues.map((i) => i.message) });
            input = parsed.data;
          } else {
            input = raw;
          }
        }
        const program = fn.run(ctx, input as never);
        const domain = yield* spec.provide(c.env, program);
        return viewed ? viewed.value(domain) : domain;
      })) as never,
  });
}
