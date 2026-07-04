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
import { Context, Layer, Effect } from "effect";
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
interface QueryBase {
  /** this model's cost (bubbles up the sulukFmt pipeline); its BDD `step` (a Given precondition); its typed errors. */
  cost?: CostModel;
  step?: Step | readonly Step[];
}

/** A MODEL that returns ONE row — `ok.schema` is DERIVED from the query's projection, the row is returned per-request, and an
 *  absent row FAILS with `orElse` (a by-id 404). The `query` is the SINGLE source: no separate response schema to maintain. */
export function queryOne<In, Row, const Errs extends readonly AnyHttpError[] = readonly []>(def: QueryBase & {
  errors?: Errs;
  query: (db: DrizzleD1Database, ctx: ActionCtx, input: In) => PromiseLike<Row[]>;
  orElse?: (ctx: ActionCtx, input: In) => InstanceType<Errs[number]>;
}): SulukFn<In, Row, Db> {
  const schema = queryZodSchema(def.query(BUILD_DB, DUMMY_CTX, DUMMY_IN as In)) as z.ZodType<Row>;
  return sulukFn({
    cost: def.cost, step: def.step, errors: def.errors, ok: { schema },
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
  query: (db: DrizzleD1Database, ctx: ActionCtx, input: In) => PromiseLike<Row[]>;
}): SulukFn<In, Row[], Db> {
  const schema = queryZodSchema(def.query(BUILD_DB, DUMMY_CTX, DUMMY_IN as In));
  return sulukFn({
    cost: def.cost, step: def.step, ok: { schema },
    run: (ctx, input: In): Effect.Effect<Row[], never, Db> => Effect.flatMap(Db, (db) => Effect.promise(() => def.query(db, ctx, input))),
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
