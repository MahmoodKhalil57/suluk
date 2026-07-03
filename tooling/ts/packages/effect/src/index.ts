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
export { ValidationError, UnauthorizedError, ForbiddenError, PaymentError, NotFoundError, ConflictError, ExternalServiceError } from "./common";
export {
  effectRoute, respond, Ok, Created, Accepted, NoContent,
  type EffectRoute, type EffectRouteSpec, type HttpSuccess, type HandlerSuccess,
} from "./route";
// the route ENVELOPE — build one up per module (`.route(effectRoute({...}))` + `.doc({...})`); it bubbles up into the
// contract (`.ops`) + the mount (`.router()`), so a module needs no separate `<module>.contract.ts`. Re-exported from
// @suluk/hono so a routes file imports effectRoute + routeGroup from one place.
export { routeGroup, isRouteGroup, type RouteGroup, type HandlerRoute } from "@suluk/hono";
// DB-as-source-of-truth — bubble a drizzle table up to a Zod schema (drizzle-zod), so request/response bodies are DERIVED
// from the database schema. Import through @suluk/effect so the effectRoute + its schemas come from one place.
export { rowSchema, insertSchema, createSelectSchema, createInsertSchema, createUpdateSchema } from "./db";
