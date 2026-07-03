/**
 * effectRoute — define a route whose Hono handler is an EFFECT, and whose v4 contract RESPONSES are DERIVED from the
 * handler's success + error types. The success body is `z.infer<ok.schema>`; the ERROR channel (a union of {@link httpError}
 * classes, which Effect accumulates as you compose functions) becomes one TYPED error response per error — each with its own
 * status + schema, not a generic ProblemDetails. The success STATUS is inferred (POST→201, DELETE→204, else 200), overridable
 * per route, and per-request via the `respond`/`Created`/… helpers — so it's never blindly hardcoded to 200.
 *
 * The `run` signature `Effect<Body, InstanceType<Errs[number]>, never>` TYPE-ENFORCES that every way the handler can fail is
 * declared in `errors` (Effect's error channel is exact) — so the contract can never claim fewer error shapes than the code
 * actually produces.
 */
import { Effect, Exit, Cause, Option } from "effect";
import type { Context } from "hono";
import type { RouteContract, RouteResponse } from "@suluk/hono";
import { toProblemDetails, PROBLEM_CONTENT_TYPE } from "@suluk/core";
import type { z } from "zod";
import { errorBody, type AnyHttpError } from "./errors";
import { UnauthorizedError, ForbiddenError } from "./common";

/** A per-request success carrying an EXPLICIT status — return `respond(201, body)` / `Created(body)` to set the status from
 *  the handler (it bubbles up), instead of the route's default. A plain body uses the route's declared/derived status. */
const SUCCESS = Symbol.for("@suluk/effect/success");
export interface HttpSuccess<B> {
  readonly [SUCCESS]: true;
  readonly status: number;
  readonly body: B;
}
export const respond = <B>(status: number, body: B): HttpSuccess<B> => ({ [SUCCESS]: true, status, body });
export const Ok = <B>(body: B): HttpSuccess<B> => respond(200, body);
export const Created = <B>(body: B): HttpSuccess<B> => respond(201, body);
export const Accepted = <B>(body: B): HttpSuccess<B> => respond(202, body);
export const NoContent = (): HttpSuccess<undefined> => respond(204, undefined);
const isHttpSuccess = (v: unknown): v is HttpSuccess<unknown> => typeof v === "object" && v !== null && (v as Record<symbol, unknown>)[SUCCESS] === true;

/** Convention: the default success status for a method when `ok.status` isn't given — so it's semantic, not always 200. */
const DEFAULT_SUCCESS_STATUS: Record<string, number> = { post: 201, put: 200, patch: 200, delete: 204, get: 200, head: 200, options: 200 };

/** The success body a handler may return: the plain body (uses the route's status) OR a `respond()`-wrapped body (its own). */
export type HandlerSuccess<B> = B | HttpSuccess<B>;

/**
 * A route's AUDIENCE — who may call it. Declaring `roles` opts the route into method-derived DEFAULTS (so you stop restating
 * the mechanical fields): `["signed-in"]` → a `<module>:<read|write>` scope (module from the path), a typed **401**
 * `UnauthorizedError`, and a principal-keyed rate-limit; `["admin"]` → the `admin` scope + 401/403; `["public"]` → no scope,
 * an IP-keyed rate-limit. Every derived field stays overridable (set `scopes`/`cost`/`rateLimit` explicitly to win).
 */
export type Role = "public" | "signed-in" | "admin";

/** The auth error instance(s) a role set IMPLIES — so a handler may fail with them WITHOUT listing them in `errors` (they
 *  come from `roles`). `signed-in` ⇒ Unauthorized; `admin` ⇒ Unauthorized | Forbidden. */
type RoleImplied<R extends readonly Role[]> =
  | ("signed-in" extends R[number] ? InstanceType<typeof UnauthorizedError> : never)
  | ("admin" extends R[number] ? InstanceType<typeof UnauthorizedError> | InstanceType<typeof ForbiddenError> : never);

/** The AUTH CONTEXT effectRoute injects as `run`'s 2nd argument. When `roles` requires auth, `userId` is GUARANTEED — the
 *  handler is only reached for a resolved principal (effectRoute returns the 401 itself otherwise), so the handler
 *  owner-scopes with `userId` directly, no `c.get("user")` read and no null-check. A public route gets `{ userId?: string }`. */
export type RoleAuth<R extends readonly Role[]> = "signed-in" extends R[number]
  ? { userId: string }
  : "admin" extends R[number]
    ? { userId: string }
    : { userId?: string };

export interface EffectRouteSpec<
  OkSchema extends z.ZodTypeAny,
  Errs extends readonly AnyHttpError[],
  Roles extends readonly Role[],
> {
  method: RouteContract["method"];
  path: string;
  name?: string;
  /** Required — a route must be DOCUMENTED (the derived contract is a `DocumentedRoute`, so it can be spread into ops). */
  summary: string;
  description?: string;
  tags?: string[];
  /** WHO may call it — declaring it DEFAULTS the scope, the auth error(s), and the rate-limit key (see {@link Role}). */
  roles?: Roles;
  /** Override the scope PREFIX (default: the path's module segment — `/api/todos/:id` → `todos`). */
  scope?: string;
  /** Override the derived scopes entirely. */
  scopes?: string[];
  security?: RouteContract["security"];
  /** Override the method-derived rate-limit (read 120/min · write 60/min; principal-keyed, or IP-keyed when public). */
  rateLimit?: RouteContract["rateLimit"];
  /** Override the method-derived cost (read = 1× d1.read · write = 1× d1.write + 1× d1.read; settled `rate-limited`). */
  cost?: RouteContract["cost"];
  internal?: boolean;
  request?: RouteContract["request"];
  /** The SUCCESS response. `status` defaults by method; `schema` is OPTIONAL — omit it and the response is documented by
   *  status + description alone. A `respond()` in the handler overrides the status per-request. `ok` itself may be omitted. */
  ok?: { status?: number; schema?: OkSchema; description?: string };
  /** The DOMAIN errors the handler can produce (the AUTH errors come from `roles` — don't list them here). Effect's error
   *  channel is checked against `errors` PLUS the role-implied auth errors — declaring fewer than the code throws is a TYPE
   *  error. Each becomes a distinct typed response (its status + schema) in the contract. */
  errors?: Errs;
  /** The handler: a fully-provided Effect (no remaining requirements) yielding the success body (or `respond(...)`) and
   *  failing only with the declared errors + the role-implied auth errors. Its 2nd arg is the injected {@link RoleAuth} — for
   *  a signed-in/admin route, `auth.userId` is GUARANTEED (effectRoute already 401'd an anonymous caller), so owner-scope
   *  with `auth.userId` directly. */
  run: (c: Context, auth: RoleAuth<Roles>) => Effect.Effect<HandlerSuccess<z.infer<OkSchema>>, InstanceType<Errs[number]> | RoleImplied<Roles>, never>;
}

export interface EffectRoute {
  /** The DERIVED v4 route contract (responses = the success + one typed response per declared error) — a `DocumentedRoute`
   *  (it carries `summary`), so it spreads straight into a `contractDoc([...])` op list. */
  contract: RouteContract & { summary: string };
  /** The Hono handler: runs the Effect, renders the success at its status, or maps a tagged failure to its status + body. */
  handler: (c: Context) => Promise<Response>;
}

/**
 * Build a route whose responses are DERIVED from the Effect handler. Returns the `contract` (to spread into your route list,
 * so emitV4/Scalar/SDK see the typed errors) + the Hono `handler` (mount it at `method`/`path`).
 */
/** The response DESCRIPTION to bubble up from a zod schema: its own `.describe(...)`, else — for a response that WRAPS a
 *  single described entity (`z.object({ todo: TodoItem })`) — the wrapped entity's `.describe(...)`. So a describe on the
 *  service's `TodoItem` schema surfaces as the route's response description without being restated. */
function schemaDescription(schema: unknown): string | undefined {
  const s = schema as { description?: string; shape?: Record<string, { description?: string }> } | undefined;
  if (s?.description) return s.description;
  const shape = s?.shape;
  if (shape && typeof shape === "object") {
    const keys = Object.keys(shape);
    if (keys.length === 1) return shape[keys[0]]?.description;
  }
  return undefined;
}

/** Method → is it a READ (GET/HEAD)? Drives the read-vs-write scope/cost/rate-limit defaults. */
const isReadMethod = (m: string): boolean => m === "get" || m === "head";

/** Method-derived DEFAULT cost — a read touches d1.read, a write touches d1.write + d1.read; both settled `rate-limited`. */
const defaultCost = (read: boolean): NonNullable<RouteContract["cost"]> =>
  read
    ? { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } }
    : { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } };

/** Method + visibility-derived DEFAULT rate-limit — reads get a looser cap; an authed route keys on the principal, a public
 *  one on the IP (no principal to key on). */
const defaultRateLimit = (read: boolean, authed: boolean): NonNullable<RouteContract["rateLimit"]> => ({
  windowMs: 60_000,
  maxRequests: read ? 120 : 60,
  key: authed ? "principal" : "ip",
});

export function effectRoute<
  OkSchema extends z.ZodTypeAny = z.ZodTypeAny,
  const Errs extends readonly AnyHttpError[] = readonly [],
  const Roles extends readonly Role[] = readonly [],
>(spec: EffectRouteSpec<OkSchema, Errs, Roles>): EffectRoute {
  const okStatus = spec.ok?.status ?? DEFAULT_SUCCESS_STATUS[spec.method] ?? 200;

  // ── DEFAULTS derived from `roles` + the method (all overridable). Declaring `roles` opts the route in; otherwise the
  //    route keeps its EXACT explicit shape (backward-compatible — a route with no `roles` gets no auto cost/rate-limit). ──
  const roles = (spec.roles ?? []) as readonly Role[];
  const hasRoles = spec.roles !== undefined;
  const isAdmin = roles.includes("admin");
  const authed = isAdmin || roles.includes("signed-in");
  const read = isReadMethod(spec.method);

  // scope prefix from the path's module segment (…/api/<seg>/… → <seg>), unless overridden.
  const segs = spec.path.split("/").filter(Boolean);
  const scopePrefix = spec.scope ?? (segs[0] === "api" ? segs[1] : segs[0]);
  const derivedScopes =
    spec.scopes ??
    (isAdmin ? ["admin"] : authed && scopePrefix ? [`${scopePrefix}:${read ? "read" : "write"}`] : undefined);
  // cost / rate-limit default only when the route opts in via `roles` (so existing role-less routes are unchanged).
  const derivedCost = spec.cost ?? (hasRoles ? defaultCost(read) : undefined);
  const derivedRateLimit = spec.rateLimit ?? (hasRoles ? defaultRateLimit(read, authed) : undefined);

  // errors = the DOMAIN errors the handler declares + the AUTH errors the roles imply (deduped by tag). So the contract's
  // typed responses (and the handler's tag→body map) cover the 401/403 without the author restating UnauthorizedError.
  const explicitErrs = (spec.errors ?? []) as readonly AnyHttpError[];
  const roleErrs: AnyHttpError[] = [];
  if (authed) roleErrs.push(UnauthorizedError as unknown as AnyHttpError);
  if (isAdmin) roleErrs.push(ForbiddenError as unknown as AnyHttpError);
  const seenTags = new Set(explicitErrs.map((e) => e.errorTag));
  const errs = [...explicitErrs, ...roleErrs.filter((e) => !seenTags.has(e.errorTag))];

  // Name the SUCCESS body from the op (e.g. "debitCredits" → "DebitCreditsOk") + each error from its tag, so emitV4 hoists
  // them into components.schemas + $refs them — a docs renderer shows the TYPE NAME, not "object" (generated from the code).
  const okName = spec.name ? `${spec.name[0].toUpperCase()}${spec.name.slice(1)}Ok` : undefined;
  const okSchema = spec.ok?.schema;
  // the response DESCRIPTION defaults from the SCHEMA's own `.describe(...)` — so the description (+ the per-field
  // descriptions + `.meta({examples})`) live ONCE on the zod schema (in the service) and bubble up, not restated per route.
  // A response WRAPPING a single described entity (`z.object({ todo: TodoItem })`) bubbles up the ENTITY's `.describe(...)`.
  const okDescription = spec.ok?.description ?? schemaDescription(okSchema) ?? "Success";
  const responses: RouteResponse[] = [
    { status: okStatus, description: okDescription, ...(okSchema ? { schema: okSchema, ...(okName ? { schemaName: okName } : {}) } : {}) },
    // one TYPED response per declared/implied error — its own status + NAMED schema (NOT a generic ProblemDetails).
    ...errs.map((E): RouteResponse => ({ status: E.status, description: E.errorTag, schema: E.bodySchema, schemaName: E.errorTag })),
  ];

  const contract: RouteContract & { summary: string } = {
    method: spec.method,
    path: spec.path,
    summary: spec.summary,
    ...(spec.name !== undefined ? { name: spec.name } : {}),
    ...(spec.description !== undefined ? { description: spec.description } : {}),
    ...(spec.tags !== undefined ? { tags: spec.tags } : {}),
    ...(derivedScopes !== undefined ? { scopes: derivedScopes } : {}),
    ...(spec.security !== undefined ? { security: spec.security } : {}),
    ...(derivedRateLimit !== undefined ? { rateLimit: derivedRateLimit } : {}),
    ...(derivedCost !== undefined ? { cost: derivedCost } : {}),
    ...(spec.internal !== undefined ? { internal: spec.internal } : {}),
    ...(spec.request !== undefined ? { request: spec.request } : {}),
    responses,
  };

  const byTag = new Map(errs.map((E) => [E.errorTag, E]));
  const UNAUTHORIZED = UnauthorizedError as unknown as AnyHttpError;

  const handler = async (c: Context): Promise<Response> => {
    // AUTH GUARD derived from `roles`: a signed-in/admin route requires a resolved principal — the auth `identity` middleware
    // set it at `c.get("user")`. Absent → the typed 401 UnauthorizedError, WITHOUT running the handler. Present → inject
    // `{ userId }` as run's 2nd arg, so the handler owner-scopes with a GUARANTEED id (no `c.get("user")` read, no null-check).
    let auth: { userId?: string } = {};
    if (authed) {
      const user = (c.var as { user?: { id?: string } }).user;
      if (!user?.id) {
        return c.json(
          errorBody({ reason: "authentication required" }, UNAUTHORIZED) as never,
          UNAUTHORIZED.status as never,
        );
      }
      auth = { userId: user.id };
    }
    const exit = await Effect.runPromiseExit(spec.run(c, auth as never));
    if (Exit.isSuccess(exit)) {
      const value = exit.value as unknown;
      const status = isHttpSuccess(value) ? value.status : okStatus;
      const body = isHttpSuccess(value) ? value.body : value;
      if (status === 204 || body === undefined) return c.body(null, status as never);
      return c.json(body as never, status as never);
    }
    // a TYPED failure → its status + typed body (the DETAILED error, not a generic ProblemDetails).
    const failure = Cause.failureOption(exit.cause);
    if (Option.isSome(failure)) {
      const e = failure.value as { _tag?: string };
      const E = e._tag ? byTag.get(e._tag) : undefined;
      if (E) return c.json(errorBody(e as Record<string, unknown>, E) as never, E.status as never);
    }
    // an undeclared failure or a DEFECT (a handler can always die) → 500 Problem Details. Surfaced, never swallowed.
    return c.json(toProblemDetails({ tag: "PayloadOperationError", detail: Cause.pretty(exit.cause) }) as never, 500, {
      "content-type": PROBLEM_CONTENT_TYPE,
    });
  };

  return { contract, handler };
}
