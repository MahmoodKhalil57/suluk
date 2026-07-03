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
export {
  effectRoute, respond, Ok, Created, Accepted, NoContent,
  type EffectRoute, type EffectRouteSpec, type HttpSuccess, type HandlerSuccess,
} from "./route";
