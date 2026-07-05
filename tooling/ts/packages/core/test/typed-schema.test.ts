import { test, expect } from "bun:test";
import { isReference } from "../src/index";
import type {
  Schema, SchemaObject, SchemaOrRef, StringSchema, Static, SecuritySchemeObject,
} from "../src/index";

/**
 * C099 — the typed JSON Schema 2020-12 model. These are COMPILE-TIME assertions: they are enforced by
 * `bun run typecheck` (core's tsconfig includes `test/**`), not by the bun:test runtime. The single runtime
 * test anchors the file so `bun test` reports it. The point of the type assertions is to make the model's
 * load-bearing guarantees regression-proof — the moment one breaks, `tsc` fails.
 */

type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assignable<From, To> = [From] extends [To] ? true : false;
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

/* ── Backward-compat LINCHPIN (the @suluk/hono `emit.ts` path) ──────────────────────────────────────────
 * `zodToV4().schema` is typed `Record<string, unknown>` and is assigned straight into `contentSchema?: SchemaOrRef`.
 * The precise variants must be strictly ADDITIVE: an opaque record — and a hand-built object literal with
 * `properties: Record<string, unknown>` (the auto-derived path slot) — MUST still assign to Schema/SchemaOrRef. */
const fromZod: Record<string, unknown> = { type: "string", minLength: 1 };
const asSchema: SchemaOrRef = fromZod;                 // must compile
const asSchema2: Schema = fromZod;                     // must compile
void asSchema; void asSchema2;
const pathSlot: SchemaOrRef = {                        // the exact emit.ts auto-derived path-parameter literal
  type: "object",
  properties: {} as Record<string, unknown>,
  required: [] as string[],
  additionalProperties: false,
};
void pathSlot;
type _compatRecord = Expect<Assignable<Record<string, unknown>, Schema>>;
type _compatBoolTrue = Expect<Assignable<true, Schema>>;
type _compatBoolFalse = Expect<Assignable<false, Schema>>;

/* ── Precise authoring / narrowing ─────────────────────────────────────────────────────────────────────── */
const str: StringSchema = { type: "string", minLength: 1, maxLength: 5, pattern: "^\\w+$", format: "email" };
const obj: SchemaObject = { type: "object", properties: { a: { type: "string" } }, required: ["a"], additionalProperties: false };
const composed: SchemaObject = { anyOf: [{ type: "string" }, { type: "null" }] };  // untyped composition variant
const opaque: SchemaObject = { "x-custom": 1 } as Record<string, unknown>;         // opaque escape variant
void str; void obj; void composed; void opaque;

/* ── Static<> inference (TypeBox parity, no dependency) ─────────────────────────────────────────────────── */
type _static_string = Expect<Equal<Static<{ type: "string" }>, string>>;
type _static_int = Expect<Equal<Static<{ type: "integer" }>, number>>;
type _static_num = Expect<Equal<Static<{ type: "number" }>, number>>;
type _static_bool = Expect<Equal<Static<{ type: "boolean" }>, boolean>>;
type _static_null = Expect<Equal<Static<{ type: "null" }>, null>>;
type _static_const = Expect<Equal<Static<{ const: 42 }>, 42>>;
type _static_enum = Expect<Equal<Static<{ enum: ["a", "b"] }>, "a" | "b">>;
type _static_array = Expect<Equal<Static<{ type: "array"; items: { type: "string" } }>, string[]>>;

type Person = { type: "object"; properties: { id: { type: "string" }; age: { type: "integer" } }; required: ["id"] };
type _static_obj_id = Expect<Equal<Static<Person>["id"], string>>;
type _static_obj_age = Expect<Equal<Static<Person>["age"], number | undefined>>;
type _static_obj_required = Expect<Equal<RequiredKeys<Static<Person>>, "id">>;   // `id` required, `age` optional

/* ── Discriminated security scheme (C099) ──────────────────────────────────────────────────────────────── */
const apiKey: SecuritySchemeObject = { type: "apiKey", name: "x-api-key", in: "header" };
const bearer: SecuritySchemeObject = { type: "http", scheme: "bearer", bearerFormat: "JWT" };
const oauth: SecuritySchemeObject = { type: "oauth2", flows: { authorizationCode: { authorizationUrl: "u", tokenUrl: "t", scopes: {} } } };
void apiKey; void bearer; void oauth;

test("C099: isReference still discriminates an OpenAPI Reference from an inline Schema", () => {
  expect(isReference({ $ref: "#/components/schemas/Pet" })).toBe(true);
  expect(isReference({ type: "string" } as SchemaOrRef)).toBe(false);
  expect(isReference(true as unknown as SchemaOrRef)).toBe(false);
  expect(isReference(undefined)).toBe(false);
});
