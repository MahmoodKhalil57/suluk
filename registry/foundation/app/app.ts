/**
 * The base app (Suluk registry: `app`) — a Hono app + the Effect-TS `Db` service every feature module builds on. Modules are
 * Effect SERVICES (a `Context.Tag` + a `Layer` wrapping `@suluk/*` logic); their routes provide the module's layer + `DbLive(env)`
 * and run the program. This file is delivered into YOUR repo by `shadcn add` and is yours to edit. Cloudflare Workers (D1) target.
 *
 * The drizzle `.zod()` SCHEMA SEAM — inline column + table refinement, the master `table.zodSchema`, `tableZod`/`tableZodSchemas`,
 * `withZod` (run a query → `{ schema, rows }` derived from the projected fields), `nanoid`, and the auto-`$ref` DB provenance —
 * lives in `@suluk/drizzle`. It is imported here (which installs the `.zod()`/`.zodSchema` augmentation as a side effect) and
 * re-exported, so a schema file gets the whole seam from `../app` with no local machinery to maintain.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Context, Layer, Effect, type Cause } from "effect";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { z } from "zod";
import { sulukFn, type ActionCtx, type SulukFn, type AnyHttpError, type CostModel } from "@suluk/effect";
import { queryZodSchema } from "@suluk/drizzle";

// The drizzle `.zod()` seam — the single published source (`@suluk/drizzle`). Re-exporting installs the column/table `.zod()` +
// `.zodSchema` augmentation (a side effect) AND hands a schema file `tableZod`/`tableZodSchemas`/`withZod`/`nanoid`.
export { tableZod, tableZodSchemas, withZod, nanoid } from "@suluk/drizzle";

export interface Bindings {
  DB: D1Database;
  /** comma-separated allowlist of browser origins the API echoes on CORS (credentials:true, never "*"). Should match
   *  the `trustedOrigins` you pass to `mountAuthRoutes` — one source of truth. */
  TRUSTED_ORIGINS?: string;
}

/** The app-owned trusted-origin allowlist (from `TRUSTED_ORIGINS`). Keep it in sync with auth's `trustedOrigins`. */
export function trustedOrigins(env: Pick<Bindings, "TRUSTED_ORIGINS">): string[] {
  return (env.TRUSTED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}
const isTrusted = (origin: string, allow: string[]): boolean => allow.includes(origin);

/** The database as an Effect service — every feature service depends on it; the app provides it per-request from the
 *  D1 binding, so services never reach for a global. */
export class Db extends Context.Tag("Db")<Db, DrizzleD1Database>() {}

/** Build the `Db` layer for one request from the Worker bindings. */
export const DbLive = (env: Bindings): Layer.Layer<Db> => Layer.succeed(Db, drizzle(env.DB));

// ── queryOne / queryMany — a MODEL from ONE query: `ok.schema` is DERIVED from the query's projected fields (no hand-written
//    `TodoItemSchema`), and the SAME query runs per-request. A drizzle db over a fake binding BUILDS the query at module-load
//    (never executed) so `queryZodSchema` can read its projection; the real `Db` executes it per-request. ────────────────────
const BUILD_DB: DrizzleD1Database = drizzle({} as unknown as D1Database); // build-only — reads projections, never runs
const DUMMY_CTX: ActionCtx = { userId: "", param: () => undefined, c: {} as never };
const DUMMY_IN = new Proxy({}, { get: () => "" }); // any prop → "" so a query factory can BUILD with placeholder args
type Step = { role: "given" | "when" | "then"; text: string };
/** a yieldable httpError instance — what an `orElse` returns (e.g. `new NotFoundError(...)`). */
type HttpErrorInstance = Cause.YieldableError & { readonly _tag: string };
interface QueryBase {
  /** this model's cost (bubbles up the sulukFmt pipeline); its BDD `step` (a Given precondition). */
  cost?: CostModel;
  step?: Step | readonly Step[];
}

/** DERIVE the doc error class from an `orElse` factory — the error is DEFINED ONCE (in `orElse`) and its CLASS (status +
 *  bodySchema) is read off a build-time instance (`orElse(...).constructor`), so you never restate `errors: [NotFoundError]`.
 *  This is the robust "define once" seam: `orElse` is a VALUE, so it survives TS type-erasure (an inline `yield* new X()` does
 *  not — the type is erased and introspecting the run is unsafe/incomplete). */
function errorOf(orElse?: (ctx: ActionCtx, input: never) => HttpErrorInstance): AnyHttpError[] {
  if (!orElse) return [];
  const cls = (orElse(DUMMY_CTX, DUMMY_IN as never) as { constructor?: unknown }).constructor as Partial<AnyHttpError> | undefined;
  return cls && typeof cls.status === "number" && cls.bodySchema ? [cls as AnyHttpError] : [];
}

/** A MODEL that returns ONE row — `ok.schema` is DERIVED from the query's projection, the row is returned per-request, and an
 *  absent row FAILS with `orElse` (a by-id 404). The `query` is the single source of the SCHEMA; `orElse` is the single source
 *  of the ERROR — both bubble into the api doc with NOTHING restated (no `ok.schema`, no `errors: […]`). */
export function queryOne<In, Row, E extends HttpErrorInstance = never>(def: QueryBase & {
  /** the input schema (usually `table.zodSchema.pick({…})`) — TYPES the query's input AND becomes the request BODY (validated +
   *  bubbled to the contract), so the input shape + its validation are DERIVED from the db, not restated. Omit for a by-id input. */
  input?: z.ZodType<In>;
  query: (db: DrizzleD1Database, ctx: ActionCtx, input: In) => PromiseLike<Row[]>;
  orElse?: (ctx: ActionCtx, input: In) => E;
}): SulukFn<In, Row, Db> {
  const schema = queryZodSchema(def.query(BUILD_DB, DUMMY_CTX, DUMMY_IN as In)) as z.ZodType<Row>;
  return sulukFn({
    cost: def.cost, step: def.step, errors: errorOf(def.orElse as never), ok: { schema },
    ...(def.input ? { body: def.input, validateBody: true } : {}),
    run: (ctx, input: In) => Effect.flatMap(Db, (db) => Effect.gen(function* () {
      const [row] = yield* Effect.promise(() => def.query(db, ctx, input));
      if (row) return row;
      if (def.orElse) return yield* Effect.fail(def.orElse(ctx, input));
      return yield* Effect.die(new Error("queryOne: query returned no row"));
    })),
  });
}

/** A MODEL that returns MANY rows — `ok.schema` is DERIVED as the ITEM schema from the query's projection (a route's `listView`
 *  arrays it). The `query` is the single source. */
export function queryMany<In, Row>(def: QueryBase & {
  input?: z.ZodType<In>;
  query: (db: DrizzleD1Database, ctx: ActionCtx, input: In) => PromiseLike<Row[]>;
}): SulukFn<In, Row[], Db> {
  const schema = queryZodSchema(def.query(BUILD_DB, DUMMY_CTX, DUMMY_IN as In));
  return sulukFn({
    cost: def.cost, step: def.step, ok: { schema },
    ...(def.input ? { body: def.input, validateBody: true } : {}),
    run: (ctx, input: In): Effect.Effect<Row[], never, Db> => Effect.flatMap(Db, (db) => Effect.promise(() => def.query(db, ctx, input))),
  });
}

/** A MUTATION that affects rows and confirms downstream — runs a `.returning()` write; if it touched NO rows, FAILS with
 *  `orElse` (a by-id 404). Like queryOne, the ERROR is DEFINED ONCE in `orElse` and bubbles into the doc (no `errors: […]`).
 *  Sets NO response schema — the wire body is shaped by a following step (e.g. `{ deleted: true }`). Returns void. */
export function mutate<In, E extends HttpErrorInstance = never>(def: QueryBase & {
  input?: z.ZodType<In>;
  query: (db: DrizzleD1Database, ctx: ActionCtx, input: In) => PromiseLike<{ readonly length: number }>;
  orElse: (ctx: ActionCtx, input: In) => E;
}): SulukFn<In, void, Db> {
  return sulukFn({
    cost: def.cost, step: def.step, errors: errorOf(def.orElse as never),
    ...(def.input ? { body: def.input, validateBody: true } : {}),
    run: (ctx, input: In) => Effect.flatMap(Db, (db) => Effect.gen(function* () {
      const rows = yield* Effect.promise(() => def.query(db, ctx, input));
      if (rows.length === 0) return yield* Effect.fail(def.orElse(ctx, input));
    })),
  });
}

/** Create the base app. Mount a feature module's router: `app.route("/credits", creditsRoutes())`. */
export function createApp() {
  const app = new Hono<{ Bindings: Bindings }>();

  // CORS on the API surface: echo a TRUSTED browser origin (credentials:true), never "*". Runs before any mount.
  app.use("/api/*", cors({ origin: (origin, c) => (isTrusted(origin, trustedOrigins(c.env)) ? origin : null), credentials: true }));

  app.get("/health", (c) => c.json({ ok: true }));
  app.get("/api/health", (c) => c.json({ ok: true, service: "suluk-api" }));

  app.onError((err, c) => {
    console.error("[app] unhandled", err);
    return c.json({ error: err instanceof Error ? err.message : "internal error" }, 500);
  });

  return app;
}

export type App = ReturnType<typeof createApp>;
