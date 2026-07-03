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

export interface EffectRouteSpec<OkSchema extends z.ZodTypeAny, Errs extends readonly AnyHttpError[]> {
  method: RouteContract["method"];
  path: string;
  name?: string;
  /** Required — a route must be DOCUMENTED (the derived contract is a `DocumentedRoute`, so it can be spread into ops). */
  summary: string;
  description?: string;
  tags?: string[];
  scopes?: string[];
  security?: RouteContract["security"];
  rateLimit?: RouteContract["rateLimit"];
  cost?: RouteContract["cost"];
  internal?: boolean;
  request?: RouteContract["request"];
  /** The SUCCESS response: its body schema + status (defaults by method; a `respond()` in the handler overrides per-request). */
  ok: { status?: number; schema: OkSchema; description?: string };
  /** Every typed error the handler can produce. Effect's error channel is checked against this — declaring fewer than the
   *  code throws is a TYPE error. Each becomes a distinct response (its status + schema) in the contract. */
  errors?: Errs;
  /** The handler: a fully-provided Effect (no remaining requirements) yielding the success body (or `respond(...)`) and
   *  failing only with the declared errors. */
  run: (c: Context) => Effect.Effect<HandlerSuccess<z.infer<OkSchema>>, InstanceType<Errs[number]>, never>;
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
export function effectRoute<OkSchema extends z.ZodTypeAny, const Errs extends readonly AnyHttpError[]>(
  spec: EffectRouteSpec<OkSchema, Errs>,
): EffectRoute {
  const okStatus = spec.ok.status ?? DEFAULT_SUCCESS_STATUS[spec.method] ?? 200;
  const errs = (spec.errors ?? []) as readonly AnyHttpError[];

  const responses: RouteResponse[] = [
    { status: okStatus, description: spec.ok.description ?? "Success", schema: spec.ok.schema },
    // one TYPED response per declared error — its own status + schema (NOT a generic ProblemDetails).
    ...errs.map((E): RouteResponse => ({ status: E.status, description: E.errorTag, schema: E.bodySchema })),
  ];

  const contract: RouteContract & { summary: string } = {
    method: spec.method,
    path: spec.path,
    summary: spec.summary,
    ...(spec.name !== undefined ? { name: spec.name } : {}),
    ...(spec.description !== undefined ? { description: spec.description } : {}),
    ...(spec.tags !== undefined ? { tags: spec.tags } : {}),
    ...(spec.scopes !== undefined ? { scopes: spec.scopes } : {}),
    ...(spec.security !== undefined ? { security: spec.security } : {}),
    ...(spec.rateLimit !== undefined ? { rateLimit: spec.rateLimit } : {}),
    ...(spec.cost !== undefined ? { cost: spec.cost } : {}),
    ...(spec.internal !== undefined ? { internal: spec.internal } : {}),
    ...(spec.request !== undefined ? { request: spec.request } : {}),
    responses,
  };

  const byTag = new Map(errs.map((E) => [E.errorTag, E]));

  const handler = async (c: Context): Promise<Response> => {
    const exit = await Effect.runPromiseExit(spec.run(c));
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
