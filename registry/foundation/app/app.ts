/**
 * The base app (Suluk registry: `app`) — a Hono app + the Effect-TS `Db` service every feature module builds on. Modules are
 * Effect SERVICES (a `Context.Tag` + a `Layer` wrapping `@suluk/*` logic); their routes provide the module's layer + `DbLive(env)`
 * and run the program. This file is delivered into YOUR repo by `shadcn add` and is yours to edit. Cloudflare Workers (D1) target.
 *
 * The drizzle `.zod()` SCHEMA SEAM — inline column + table refinement, the master `table.zodSchema`, `tableZod`/`tableZodSchemas`,
 * `withZod` (run a query → `{ schema, rows }` derived from the projected fields), `nanoid`, and the auto-`$ref` DB provenance —
 * lives in `@suluk/drizzle`. It is imported here (which installs the `.zod()`/`.zodSchema` augmentation as a side effect) and
 * re-exported, so a schema file gets the whole seam from `../app` with no local machinery to maintain.
 *
 * The drizzle `.policy()` EXECUTION-POLICY SEAM (C111) — `queryOne`/`queryMany`/`mutate` read the query's OWN target table
 * (`queryTable`, uniform across select/insert/update/delete) and, if that table declared a `.policy({...})` (retry/timeout/
 * idempotency/dedupe/rate-limit, co-located with its DDL like `.zod()`), fold it into the derived `sulukFn` AUTOMATICALLY —
 * so a model that queries a `.policy()`-bearing table needs no restated execution-policy config at its own call site.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Context, Layer, Effect, type Cause } from "effect";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { z } from "zod";
import {
  sulukFn, type ActionCtx, type SulukFn, type AnyHttpError, type CostModel, type SulukStore,
  type SulukRateLimit, type SulukDedupe, type SulukRunNodeKind,
} from "@suluk/effect";
import { queryZodSchema, queryTable, queryKind, tablePolicy } from "@suluk/drizzle";

// The drizzle `.zod()` seam — the single published source (`@suluk/drizzle`). Re-exporting installs the column/table `.zod()` +
// `.zodSchema` augmentation (a side effect) AND hands a schema file `tableZod`/`tableZodSchemas`/`withZod`/`nanoid`.
export { tableZod, tableZodSchemas, withZod, nanoid } from "@suluk/drizzle";
// the table-level execution-policy seam (C111) — installs `.policy()` as a side effect; a schema file can declare a
// table's policy without a separate `@suluk/drizzle` import.
export { tablePolicy, queryTable } from "@suluk/drizzle";

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
  /** this model's reactive-STORE facet (C037), bubbled up like cost → the route's `x-suluk-store`: a READ model BACKS a store
   *  (`{ key, params? }`), a WRITE model INVALIDATES stores (`{ invalidates: [...] }`). Names store/param NAMES, never values. */
  store?: SulukStore;
  /** override the RATE-LIMIT/DEDUPE budget this model bubbles (REAL, HTTP-enforced) — otherwise read AUTOMATICALLY off the
   *  query's own target table's `.policy()` (C111, `@suluk/drizzle`), so most models declare neither. */
  rateLimit?: SulukRateLimit;
  dedupe?: SulukDedupe;
  /** OPT IN to the `x-suluk-run` pipeline graph (C104) as a labeled node — a stable name for this model in the graph. When
   *  given, the node's execution-policy fields (retry/timeoutMs/idempotent/effect/requiresIdempotencyKey/
   *  idempotencyKeySource) are read AUTOMATICALLY off the query's own target table's `.policy()` (C111) — a label is all a
   *  model needs to fully participate; the policy itself lives once, on the table. */
  node?: string;
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

/** RESOLVE this model's rate-limit/dedupe: an explicit `def` value wins; else the query's own target table's `.policy()`
 *  (C111) — read off the SAME build-time query object `queryZodSchema` already reads, so the table is never queried twice.
 *  `dedupe` is WRITE-ONLY (a `queryKind` of `"select"` never picks it up): a table's dedupe/idempotency-key policy exists
 *  to guard against a double WRITE, so a plain read sharing the table (e.g. `findPayment` next to `chargePayment`) must
 *  never inherit it — an explicit `def.dedupe` override still applies regardless of query kind, since the author asked
 *  for it directly. */
function policyOf(def: QueryBase, builtQuery: unknown): Pick<QueryBase, "rateLimit" | "dedupe"> {
  const table = queryTable(builtQuery);
  const policy = table ? tablePolicy(table) : {};
  const isWrite = queryKind(builtQuery) !== "select";
  return {
    ...(def.rateLimit ?? policy.rateLimit ? { rateLimit: def.rateLimit ?? policy.rateLimit } : {}),
    ...(def.dedupe ?? (isWrite ? policy.dedupe : undefined) ? { dedupe: def.dedupe ?? policy.dedupe } : {}),
  };
}

/** RESOLVE this model's `x-suluk-run` node (C104), if `def.node` opted in: the label is the only thing a model states —
 *  every execution-policy field is read off the query's own target table's `.policy()` (C111). `undefined` when `def.node`
 *  is omitted (the default — zero impact on a model that doesn't participate in the graph). The idempotency-specific
 *  fields (`requiresIdempotencyKey`/`idempotencyKeySource`) are WRITE-ONLY for the same reason `dedupe` is in {@link
 *  policyOf} — retry/timeout/idempotent/effect stay universal (a flaky READ can legitimately want a retry too). */
function nodeOf(def: QueryBase, builtQuery: unknown): { label: string; kind: SulukRunNodeKind } | undefined {
  if (!def.node) return undefined;
  const table = queryTable(builtQuery);
  const policy = table ? tablePolicy(table) : {};
  const isWrite = queryKind(builtQuery) !== "select";
  return {
    label: def.node,
    kind: "internal",
    ...(policy.retry ? { retry: policy.retry } : {}),
    ...(policy.timeoutMs !== undefined ? { timeoutMs: policy.timeoutMs } : {}),
    ...(policy.idempotent !== undefined ? { idempotent: policy.idempotent } : {}),
    ...(policy.effect ? { effect: policy.effect } : {}),
    ...(isWrite && policy.requiresIdempotencyKey !== undefined ? { requiresIdempotencyKey: policy.requiresIdempotencyKey } : {}),
    ...(isWrite && policy.idempotencyKeySource ? { idempotencyKeySource: policy.idempotencyKeySource } : {}),
    ...(isWrite && policy.dedupe ? { dedupe: policy.dedupe } : {}),
  };
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
  const builtQuery = def.query(BUILD_DB, DUMMY_CTX, DUMMY_IN as In);
  const schema = queryZodSchema(builtQuery) as z.ZodType<Row>;
  const node = nodeOf(def, builtQuery);
  return sulukFn({
    cost: def.cost, step: def.step, store: def.store, errors: errorOf(def.orElse as never), ok: { schema },
    ...policyOf(def, builtQuery),
    ...(node ? { node } : {}),
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
  const builtQuery = def.query(BUILD_DB, DUMMY_CTX, DUMMY_IN as In);
  const schema = queryZodSchema(builtQuery);
  const node = nodeOf(def, builtQuery);
  return sulukFn({
    cost: def.cost, step: def.step, store: def.store, ok: { schema },
    ...policyOf(def, builtQuery),
    ...(node ? { node } : {}),
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
  const builtQuery = def.query(BUILD_DB, DUMMY_CTX, DUMMY_IN as In);
  const node = nodeOf(def, builtQuery);
  return sulukFn({
    cost: def.cost, step: def.step, store: def.store, errors: errorOf(def.orElse as never),
    ...policyOf(def, builtQuery),
    ...(node ? { node } : {}),
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
