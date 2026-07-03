/**
 * A SERVICE ACTION — one service call fused with the RUNTIME VALUES needed to bubble up an HTTP contract that TS type-erasure
 * forbids deriving from a return type. A route (see {@link effectPipeRoute}) is a PIPELINE of these actions; walking the
 * pipeline collects the whole contract:
 *   • `input`  — the request-body zod schema (→ the contract's `request.json`). A runtime value; omit for a body-less action.
 *   • `output` — the DOMAIN output zod schema (what `run` yields, e.g. `TodoItemSchema` or `z.array(TodoItemSchema)`).
 *   • `wrap`   — the response ENVELOPE: the wire body's schema + the map that produces it (`{ todo }` / `{ todos }`), built
 *                TOGETHER (see {@link envelope}) so the doc shape and the runtime shape provably agree (constraint 6).
 *   • `errors` — the {@link httpError} CLASSES this action can fail with — runtime values carrying `status` + `bodySchema`,
 *                so a 404 bubbles into the contract off the class (never a generic ProblemDetails).
 *   • `status` — an optional success-status override (create → 201); else the route's method default.
 * The `run` returns an Effect that STILL REQUIRES its service tag (`R`, e.g. `Todo`) — discharged per-request by the route's
 * `provide`. So an action is `routes → services → (db | third-party)`: it calls a SERVICE, never the DB directly.
 */
import { z } from "zod";
import type { Effect } from "effect";
import type { Context } from "hono";
import type { CostModel } from "@suluk/cost";
import type { SulukRateLimit } from "@suluk/core";
import type { RouteContract } from "@suluk/hono";
import type { AnyHttpError } from "./errors";
import type { Role } from "./route";

const ACTION = Symbol.for("@suluk/effect/action");

/**
 * The standalone-OPERATION identity an {@link op} carries — the fields that make a composable function ALSO a complete v4
 * operation (a core {@link Request}: `method` + path params, `responses` = the wrap + errors, its scope/roles). A route
 * FOLDS its entry op's meta for `method`/`path`/`summary`/`roles`/… when the route spec omits them, so the function is
 * defined ONCE at source and the route just mounts it. Composed (seq/all/branch) functions ignore a downstream op's meta —
 * only the ENTRY op's meta is the route identity (the composite may still override any field).
 */
export interface OpMeta {
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
  /** validate the request body against `input` and fail with a typed 400 (else pass the raw body through). */
  validateBody?: boolean;
}

/** The per-request context an action reads. `userId` is the injected principal (guaranteed for a signed-in/admin route, as
 *  effectRoute injects it — a public pipeline route gets `""`). `param` reads a path param; `c` is the raw Hono ctx. */
export interface ActionCtx {
  readonly c: Context;
  readonly userId: string;
  readonly param: (name: string) => string | undefined;
}

/**
 * A response ENVELOPE — where constraint 6's `{ todo: TodoItem }` / `{ todos: [...] }` wrap lives. `schema` (the wire body's
 * zod schema, → `ok.schema`) and `value` (the map from the domain value to that body) are built TOGETHER by {@link envelope}/
 * {@link listEnvelope}, so the documented shape and the rendered shape cannot drift. `Dom` = the service's domain value;
 * `Wire` = the wrapped wire body.
 */
export interface Envelope<Dom, Wire> {
  readonly schema: z.ZodType<Wire>;
  readonly value: (domain: Dom) => Wire;
}

/**
 * A service action. `In` — the request-body type (`z.infer<input>`), `void` when it reads no body. `Dom` — the DOMAIN value
 * `run` yields (must match `output`). `Err` — the httpError-instance union `run` can fail with. `R` — the Effect requirement
 * (`Todo`), discharged at request time by the route's `provide`.
 */
export interface ServiceAction<In, Dom, Err, R> {
  readonly [ACTION]: true;
  /** request-body schema → the contract's `request.json`. Undefined for a body-less (GET/DELETE) action. */
  readonly input?: z.ZodType<In>;
  /** DOMAIN output schema — MUST equal what `run` yields (fixes `Dom`, checked against `wrap`). */
  readonly output: z.ZodType<Dom>;
  /** the response envelope: `schema` → `ok.schema`; `value` applied to `run`'s result at render. */
  readonly wrap: Envelope<Dom, unknown>;
  /** the httpError CLASSES this action can fail with (runtime values carrying status + bodySchema). */
  readonly errors: readonly AnyHttpError[];
  /** optional success-status override (create → 201); else the route's method default. */
  readonly status?: number;
  /** this action's COST contribution — its own infra touches / metered components (`{ infra: { "d1.read": 1 } }`). When a
   *  route composes actions, effectPipeRoute SUMS these (the CostModel monoid) so the route cost is DERIVED from what it
   *  actually does, not hand-guessed. Omit and the route falls back to effectRoute's roles-derived default. */
  readonly cost?: CostModel;
  /** this action's RATE-LIMIT budget hint. A route takes the TIGHTEST (most restrictive) budget across its composed actions
   *  — calling the route once calls this action once, so its cap bounds the route. The `key` is route-owned (from roles). */
  readonly rateLimit?: SulukRateLimit;
  /** OPTIONAL standalone-operation identity (set by {@link op}, absent for a bare {@link action}): the entry op's `meta` is
   *  the route's `method`/`path`/`summary`/`roles`/… when the route spec omits them — so a function defines its whole
   *  operation ONCE and the route just mounts it. */
  readonly meta?: OpMeta;
  /** the Effect impl — `In` is the parsed body (or void); `R` is the undischarged service requirement. */
  readonly run: (ctx: ActionCtx, input: In) => Effect.Effect<Dom, Err, R>;
}

/** Any action — for the runtime AST walk, where the schema-value types are irrelevant. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyServiceAction = ServiceAction<any, any, any, any>;

/** Type guard — is `v` a {@link ServiceAction}? */
export const isAction = (v: unknown): v is AnyServiceAction =>
  typeof v === "object" && v !== null && (v as Record<symbol, unknown>)[ACTION] === true;

/**
 * Author a {@link ServiceAction}. `output` fixes `Dom`; `wrap` must consume that SAME `Dom` — so a single-item `output` with
 * a list `wrap` (or vice-versa) is a COMPILE error, not a runtime surprise. `input` (if given) fixes the request-body type.
 *
 *   export const getTodo = action({
 *     output: TodoItemSchema, wrap: envelope("todo", TodoItemSchema), errors: [NotFoundError],
 *     run: (ctx) => Effect.flatMap(Todo, (s) => s.get(ctx.userId, ctx.param("id")!)),
 *   });
 */
export function action<In, Dom, Err = never, R = never>(def: {
  input?: z.ZodType<In>;
  output: z.ZodType<Dom>;
  wrap: Envelope<Dom, unknown>;
  errors?: readonly AnyHttpError[];
  status?: number;
  cost?: CostModel;
  rateLimit?: SulukRateLimit;
  run: (ctx: ActionCtx, input: In) => Effect.Effect<Dom, Err, R>;
}): ServiceAction<In, Dom, Err, R> {
  return { [ACTION]: true, ...def, errors: def.errors ?? [] };
}

/**
 * Author an OP — a service function that IS a complete operation: it carries its own {@link OpMeta} route identity
 * (`method`/`path`/`roles`/`summary`) ALONGSIDE the wire contract + impl, so the function is defined ONCE at source and a
 * route just mounts it (`effectPipeRoute({ provide, pipeline: pipeline(getTodo) })` reads method/path/roles from the op).
 * This dissolves the service layer: the op's `run` calls the base `Db` directly (`Effect.flatMap(Db, db => …)`, `R = Db`),
 * there is no separate `Context.Tag` service to wrap. An op is still a plain composable leaf — usable in `seq`/`all`/`branch`
 * exactly like an {@link action} (only the ENTRY op's meta becomes the composite route's identity).
 *
 *   export const getTodo = op({
 *     method: "get", path: "/api/todos/:id", roles: ["signed-in"], summary: "Get one todo the caller owns.",
 *     output: TodoItemSchema, wrap: envelope("todo", TodoItemSchema), errors: [NotFoundError], cost: readCost,
 *     run: (ctx) => Effect.flatMap(Db, (db) => …),
 *   });
 */
export function op<In, Dom, Err = never, R = never>(def: {
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
  validateBody?: boolean;
  input?: z.ZodType<In>;
  output: z.ZodType<Dom>;
  wrap: Envelope<Dom, unknown>;
  errors?: readonly AnyHttpError[];
  status?: number;
  cost?: CostModel;
  rateLimit?: SulukRateLimit;
  run: (ctx: ActionCtx, input: In) => Effect.Effect<Dom, Err, R>;
}): ServiceAction<In, Dom, Err, R> {
  const { method, path, name, summary, description, tags, roles, scope, scopes, internal, validateBody, ...actionDef } = def;
  const meta: OpMeta = { method, path, name, summary, description, tags, roles, scope, scopes, internal, validateBody };
  return { ...action(actionDef), meta };
}

/**
 * Build a `{ [key]: domain }` single-entity envelope — `schema = z.object({ key: domainSchema })` and `value = (d) => ({ key: d })`
 * from ONE call, so they can't drift. `describe` sets the wire body's description (else it bubbles from the entity's own
 * `.describe(...)` via effectRoute's single-key unwrap).
 */
export function envelope<K extends string, Dom>(
  key: K,
  domainSchema: z.ZodType<Dom>,
  opts?: { describe?: string },
): Envelope<Dom, { [P in K]: Dom }> {
  let schema = z.object({ [key]: domainSchema } as unknown as Record<K, z.ZodType<Dom>>) as unknown as z.ZodType<{ [P in K]: Dom }>;
  if (opts?.describe) schema = (schema as z.ZodType<{ [P in K]: Dom }> & { describe(d: string): z.ZodType<{ [P in K]: Dom }> }).describe(opts.describe);
  return { schema, value: (domain: Dom) => ({ [key]: domain }) as { [P in K]: Dom } };
}

/** Build a `{ [key]: Dom[] }` list envelope — `schema = z.object({ key: z.array(itemSchema) })` + the matching `value`. */
export function listEnvelope<K extends string, Dom>(
  key: K,
  itemSchema: z.ZodType<Dom>,
  opts?: { describe?: string },
): Envelope<Dom[], { [P in K]: Dom[] }> {
  let schema = z.object({ [key]: z.array(itemSchema) } as unknown as Record<K, z.ZodType<Dom[]>>) as unknown as z.ZodType<{ [P in K]: Dom[] }>;
  if (opts?.describe) schema = (schema as z.ZodType<{ [P in K]: Dom[] }> & { describe(d: string): z.ZodType<{ [P in K]: Dom[] }> }).describe(opts.describe);
  return { schema, value: (domain: Dom[]) => ({ [key]: domain }) as { [P in K]: Dom[] } };
}

/** A FIXED-body envelope — the wire body is a CONSTANT (e.g. `{ deleted: true }`), ignoring the domain value (a `void`-yielding
 *  action like a delete). `schema` documents it; `value` returns the constant. On a DELETE route, effectPipeRoute defaults the
 *  success status to 200 (not the 204 method-default, which would drop this body) — so a body-carrying delete needs no explicit
 *  `status`. */
export function fixedEnvelope<Dom, Wire>(schema: z.ZodType<Wire>, body: Wire): Envelope<Dom, Wire> {
  return { schema, value: () => body };
}
