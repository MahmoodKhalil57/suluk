/**
 * TYPED HTTP ERRORS — the primitive that lets a handler's Effect ERROR CHANNEL bubble up into the contract as DETAILED
 * error responses instead of a single generic ProblemDetails. An `httpError(tag, status, schema)` is an Effect
 * `Data.TaggedError` (fail with it via `yield* new E(...)`, `Effect.fail(new E(...))`, or by calling a service that fails
 * with it) that ALSO carries, statically, its HTTP `status` + a zod `schema` for its body. Because Effect UNIONS the error
 * channel automatically as you compose functions, the set of errors a route can produce IS its `E` type — and a route
 * turns that union into one typed response per error (each with its own status + schema).
 */
import { Data } from "effect";
import type { Cause } from "effect";
import type { z } from "zod";

/** A typed HTTP error CLASS: construct `new E(payload)` (payload matches `schema`); the instance is a `Data.TaggedError`
 *  (Effect-yieldable) carrying `_tag` + the payload, and the class carries the HTTP `status` + response-body `schema`. */
export interface HttpErrorClass<Tag extends string, S extends z.ZodObject<z.ZodRawShape>> {
  /** the discriminating tag (also the Effect `_tag`). */
  readonly errorTag: Tag;
  /** the HTTP status this error maps to. */
  readonly status: number;
  /** the zod schema of this error's RESPONSE BODY — surfaced into the contract as the response for `status`. */
  readonly bodySchema: S;
  new (payload: z.infer<S>): Cause.YieldableError & { readonly _tag: Tag } & Readonly<z.infer<S>>;
}

/**
 * Define a TYPED HTTP error. The returned class is an Effect `Data.TaggedError` (so it composes into the error channel of
 * any Effect that fails with it, and is `yield*`-able in `Effect.gen`) carrying its HTTP `status` + response-body `schema`.
 * A route lists the errors it can produce; each becomes a distinct, typed response (its status + schema) in the emitted v4
 * doc — the caller sees the ACTUAL error shape, not a generic ProblemDetails.
 *
 *   const InsufficientCredits = httpError("InsufficientCredits", 402, z.object({ required: z.number(), balance: z.number() }));
 *   // fail with it inside an Effect:  yield* new InsufficientCredits({ required: 10, balance: 3 })
 */
export function httpError<Tag extends string, S extends z.ZodObject<z.ZodRawShape>>(tag: Tag, status: number, schema: S): HttpErrorClass<Tag, S> {
  // Base with a CONCRETE Record payload (Data.TaggedError rejects an opaque generic); the precise payload type is applied
  // via the HttpErrorClass cast — runtime accepts the object either way.
  class E extends Data.TaggedError(tag)<Record<string, unknown>> {
    static readonly errorTag = tag;
    static readonly status = status;
    static readonly bodySchema = schema;
  }
  return E as unknown as HttpErrorClass<Tag, S>;
}

/** The structural shape a route reads off any typed-error class (its statics + that it constructs a `_tag`-carrying value). */
export interface AnyHttpError {
  readonly errorTag: string;
  readonly status: number;
  readonly bodySchema: z.ZodObject<z.ZodRawShape>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (payload: any): { readonly _tag: string };
}

/** Extract the error body (exactly the schema's fields) off a thrown instance — Effect/Error internals stripped. */
export function errorBody(instance: Record<string, unknown>, E: AnyHttpError): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(E.bodySchema.shape)) out[key] = instance[key];
  return out;
}
