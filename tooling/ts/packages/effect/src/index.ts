/**
 * `@suluk/effect` — Effect-native routes for the Suluk v4 contract. The handler is an Effect; the contract's RESPONSES are
 * DERIVED from the handler's success + error types, so:
 *   • every way the handler can FAIL (its Effect error channel — a union of `httpError` classes Effect accumulates for you)
 *     bubbles into the doc as a DETAILED, typed error response (its own status + schema), not a generic ProblemDetails;
 *   • the SUCCESS status is inferred (POST→201, DELETE→204, else 200), overridable per route + per-request via `respond`/
 *     `Created`/… — never blindly hardcoded to 200.
 *
 *   const NotEnough = httpError("InsufficientCredits", 402, z.object({ required: z.number(), balance: z.number() }));
 *   const { contract, handler } = effectRoute({
 *     method: "post", path: "/credits/debit", name: "debitCredits",
 *     ok: { schema: z.object({ ok: z.literal(true) }) },           // 201 by convention (POST)
 *     errors: [NotEnough],                                          // → a typed 402 response with { required, balance }
 *     run: (c) => Effect.gen(function* () {                         // fails ONLY with NotEnough (type-enforced)
 *       const { userId, amount } = yield* readBody(c);
 *       return yield* debit(userId, amount);                        // debit fails with NotEnough → bubbles to E
 *     }),
 *   });
 *   // spread `contract` into your route list; mount `handler` at post /credits/debit.
 */
export { httpError, errorBody, type HttpErrorClass, type AnyHttpError } from "./errors";
// reusable typed errors for the failure modes routes share (mapped to @suluk/core's status table) — reach for these first.
export { ValidationError, UnauthorizedError, ForbiddenError, PaymentError, NotFoundError, ConflictError, ExternalServiceError, TimeoutError } from "./common";
export {
  effectRoute, respond, Ok, Created, Accepted, NoContent,
  type EffectRoute, type EffectRouteSpec, type HttpSuccess, type HandlerSuccess,
} from "./route";
// the route ENVELOPE — build one up per module (`.route(effectRoute({...}))` + `.doc({...})`); it bubbles up into the
// contract (`.ops`) + the mount (`.router()`), so a module needs no separate `<module>.contract.ts`. Re-exported from
// @suluk/hono so a routes file imports effectRoute + routeGroup from one place.
export { routeGroup, isRouteGroup, type RouteGroup, type HandlerRoute } from "@suluk/hono";
// The two WIRE-BOUNDARY primitives a sulukFn's `run` reads and returns: `ActionCtx` (the per-request context) and the response
// ENVELOPE (`envelope`/`listEnvelope` build the `{ todo }`/`{ todos: [...] }` wrap — schema + value together, so they can't drift;
// a route's `view`/`listView` is exactly a pending one). `CostModel`/`SulukRateLimit` are the bubbling facets a leaf declares.
export { envelope, listEnvelope, type ActionCtx, type Envelope } from "./envelope";
export type { CostModel } from "@suluk/cost";
export type { SulukRateLimit, SulukDedupe, SulukStore, SulukRunGraph, SulukRunNode, SulukRunEdge, SulukRunNodeKind } from "@suluk/core";
// THE SULUK FUNCTION — the ONE composable unit that carries a SLICE of the core v4 `Request` and BUBBLES it under composition,
// the way `Effect` is Effect-TS's unit. Every layer — MODEL, SERVICE, ROUTE — is a `sulukFn`; `sulukFmt(...fns)` RUNS+FORMATS a
// linear pipeline of them (a service `sulukFmt`s its models, a route `sulukFmt`s its services) and `sulukFmt.all({k:fn})` fans
// OUT (branches on one input → a derived `{ k }` body). Facts live on the leaf model — cost DEFINED there, errors declared once,
// response schema from the db — and bubble up (cost SUM, errors UNION, schema inherited), so services/routes hand-declare none.
// `sulukRoute` projects the merged slice onto effectRoute (host + api reference). Any layer split is just how you compose.
export {
  sulukFn, sulukFmt, view, listView, sulukRoute, isSulukFn, ref, lintRunGraph,
  type SulukFn, type AnySulukFn, type RequestSlice, type SliceProvider, type View,
  type SulukRouteSpec, type ReqOf, type RefFn, type NodesAndEdges,
} from "./suluk-fn";
// DB-as-source-of-truth — bubble a drizzle table up to a Zod schema (drizzle-zod), so request/response bodies are DERIVED
// from the database schema. Import through @suluk/effect so the effectRoute + its schemas come from one place.
export { rowSchema, insertSchema, createSelectSchema, createInsertSchema, createUpdateSchema } from "./db";
