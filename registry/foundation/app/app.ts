/**
 * The base app (Suluk registry: `app`) — a Hono app + the Effect-TS runtime seam every feature service builds on. Feature
 * modules (`credits`, `keys`, `billing`, …) are Effect SERVICES (a `Context.Tag` + a `Layer` that wraps the `@suluk/*`
 * logic); their routes provide the module's layer + `DbLive(env)` and run the program. This file is delivered into YOUR
 * repo by `shadcn add` and is yours to edit. Cloudflare Workers target (D1 binding).
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Context, Layer } from "effect";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { getTableColumns, type Table } from "drizzle-orm";
import { SQLiteColumnBuilder } from "drizzle-orm/sqlite-core/columns/common";
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import { createSelectSchema, createInsertSchema, createUpdateSchema, type BuildRefine, type NoUnknownKeys, type BuildSchema } from "drizzle-zod";
import { z } from "zod";

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

// ── INLINE zod on columns ─────────────────────────────────────────────────────────────────────────────────
// `.zod(refiner)` co-locates a column's wire refinement WITH its DDL: it stashes the drizzle-zod refine callback
// ON the column (returning `this`, so the drizzle chain + `sqliteTable` are unaffected), and `tableSchemas` reads
// it back — so a module annotates each field on the column (`text("title").notNull().zod(s => s.describe(…))`)
// instead of in a separate object. Runtime-augments the SQLite column builder (D1 is SQLite). The `s` a refiner
// receives is typed by drizzle's coarse dataType (string→ZodString, …). See db/todo.ts for the worked pattern.
type ZodForData<D> = D extends "string" ? z.ZodString
  : D extends "number" | "bigint" ? z.ZodNumber
  : D extends "boolean" ? z.ZodBoolean
  : D extends "date" ? z.ZodDate
  : z.ZodType;
type ZodRefiner = (schema: z.ZodType) => z.ZodType;
const ZOD_REFINER = Symbol.for("suluk.drizzle.inlineZod");

declare module "drizzle-orm/sqlite-core/columns/common" {
  interface SQLiteColumnBuilder {
    /** Co-locate this column's zod refinement (the drizzle-zod refine callback; omit to just mark it). Receives the
     *  column's base schema, returns the refined one — return another field's zod to reuse it. Read by `tableSchemas`. */
    zod(refiner?: (schema: ZodForData<this["_"]["dataType"]>) => z.ZodType): this;
  }
}
if (!Object.prototype.hasOwnProperty.call(SQLiteColumnBuilder.prototype, "zod")) {
  Object.defineProperty(SQLiteColumnBuilder.prototype, "zod", {
    value: function (this: { config: Record<string | symbol, unknown> }, refiner?: ZodRefiner) {
      this.config[ZOD_REFINER] = refiner ?? ((s: z.ZodType) => s);
      return this;
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

// TABLE-LEVEL `.zod()` — the same seam, ONE level up: `sqliteTable(…).zod(s => s.meta({ description: "…" }))` co-locates the
// ENTITY-level refinement (the whole-object `.describe()`/`.meta()`) WITH the table. Read back by `tableSchemas` and applied to
// the SELECT object, so a route whose body wraps a row carries the entity description. The refiner receives the derived object
// schema and returns it refined. Stored in a WeakMap (not on the drizzle table object) so we never mutate drizzle internals.
type TableRefiner = (schema: z.ZodType) => z.ZodType;
const tableRefiners = new WeakMap<object, TableRefiner>();
/** memoize the derived master schema per table instance — `todo.zodSchema` is referentially stable + computed once. */
const zodSchemaCache = new WeakMap<object, unknown>();
/** The precise SELECT zod-object type for a drizzle table `T` — its columns handed to drizzle-zod's `BuildSchema` (the SAME
 *  path `tableSchemas`/`createSelectSchema` use, so `z.infer<typeof table.zodSchema>` is the exact row). A helper (not
 *  `this["_"]["columns"]` inline) because `this`-indexing is disallowed in a nested type arg. */
type TableSelectSchema<T extends Table> = BuildSchema<"select", T["_"]["columns"], undefined, undefined>;
declare module "drizzle-orm/sqlite-core" {
  interface SQLiteTable {
    /**
     * Co-locate this TABLE's entity-level zod refinement (the whole-object `.meta()`/`.describe()`) AND expose the MASTER
     * `zodSchema` on the returned table: the annotated SELECT projection (every column's co-located `.zod()` + this entity
     * refinement), read STATICALLY and PRECISELY typed per-table (drizzle-zod's `BuildSchema` over `this` columns). The single
     * source you infer everything from — `z.infer<typeof todo.zodSchema>` is the exact row; slice ops off it
     * (`todo.zodSchema.pick({ title: true })`). Returned as an INTERSECTION (not an `SQLiteTable`-interface property) so a
     * table stays assignable to drizzle's query builders; only a table that calls `.zod()` carries the typed `zodSchema`.
     */
    zod<Self extends Table>(this: Self, refiner: (schema: z.ZodType) => z.ZodType): Self & { readonly zodSchema: TableSelectSchema<Self> };
  }
}
if (!Object.prototype.hasOwnProperty.call(SQLiteTable.prototype, "zod")) {
  Object.defineProperty(SQLiteTable.prototype, "zod", {
    value: function (this: object, refiner: TableRefiner) {
      tableRefiners.set(this, refiner);
      return this;
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}
if (!Object.prototype.hasOwnProperty.call(SQLiteTable.prototype, "zodSchema")) {
  Object.defineProperty(SQLiteTable.prototype, "zodSchema", {
    get(this: Table) {
      let cached = zodSchemaCache.get(this);
      if (!cached) { cached = tableSchemas(this).select; zodSchemaCache.set(this, cached); }
      return cached;
    },
    configurable: true,
    enumerable: false,
  });
}

/**
 * Derive a table's three drizzle-zod schemas in ONE call — so a module defines its table ONCE and reads its
 * `select` (a full row), `insert` (writable columns, defaults optional) and `update` (all optional) schemas + (via
 * `z.infer`) their TS types from here, instead of rewriting `createSelectSchema(table)` / `createInsertSchema(table)` /
 * `createUpdateSchema(table)` in every schema file. The SELECT schema is annotated by the columns' co-located
 * `.zod()` refinements (per-field `.describe()` + `.meta({examples})`), so those labels bubble up into the wire
 * response body / Scalar; the optional `refine` argument still works and OVERRIDES a co-located refiner on conflict.
 * Generic over the table, so every field keeps its precise type — `z.infer<typeof tableSchemas(t).select>` is the row.
 *
 *   const todo = sqliteTable("todo", { title: text("title").notNull().zod(s => s.describe("The todo text.")) });
 *   const { select, insert, update } = tableSchemas(todo);   // reads the co-located `.zod()` refinements
 *   type Row = z.infer<typeof select>;   // { id: string; title: string; completed: boolean; ... }
 */
export function tableSchemas<T extends Table, R extends BuildRefine<T["_"]["columns"], undefined> = BuildRefine<T["_"]["columns"], undefined>>(
  table: T,
  refine?: NoUnknownKeys<R, T["$inferSelect"]>,
) {
  // collect the co-located `.zod()` refiners off the columns, then let an explicit `refine` win on conflict.
  const inline: Record<string, ZodRefiner> = {};
  for (const [key, col] of Object.entries(getTableColumns(table))) {
    const r = (col as unknown as { config?: Record<string | symbol, unknown> }).config?.[ZOD_REFINER];
    if (typeof r === "function") inline[key] = r as ZodRefiner;
  }
  const merged = { ...inline, ...(refine as Record<string, ZodRefiner> | undefined) };
  // The co-located refinements (constraints + `.meta()`) ride into the SELECT schema; the table-level `.zod()` refiner (if
  // any) annotates the whole SELECT object. A request body reuses a refined `select.shape.<field>` (see db/todo.ts), so a
  // column's `.max(500)` validates on create/patch too — WITHOUT re-refining insert/update (that collides with drizzle-zod's
  // per-projection `BuildRefine` generic → a TS2589 depth blow-up on a complex table; select-shape reuse is the clean path).
  const entity = tableRefiners.get(table);
  // Pass `merged` at runtime but keep the STATIC type of `refine`, so drizzle-zod infers the precise return (`.shape.title`
  // stays `ZodString`).
  const baseSelect = createSelectSchema(table, merged as unknown as typeof refine);
  // The table-level `.zod()` refiner annotates the whole ENTITY (`.meta({ description })`). Applying it in the typed `select`
  // position (`entity(baseSelect)`) forces TS to instantiate drizzle-zod's deep select type → a TS2589 blow-up; so instead we
  // run the refiner once to READ its metadata and register that on `baseSelect` IN-PLACE (same instance keeps the precise type).
  if (entity) {
    // cast through `unknown` so passing the deep-typed select to the refiner doesn't force its assignability check (TS2589).
    const annotated = entity(baseSelect as unknown as z.ZodType) as { meta?: () => Record<string, unknown> | undefined };
    const meta = annotated.meta?.();
    if (meta) z.globalRegistry.add(baseSelect as unknown as z.ZodType, meta);
  }
  return {
    select: baseSelect,
    insert: createInsertSchema(table),
    update: createUpdateSchema(table),
  };
}

/** A URL-safe **nanoid** — 21 chars from `[A-Za-z0-9_-]`, crypto-backed, DEPENDENCY-FREE. Use as a column default:
 *  `text("id").primaryKey().$defaultFn(() => nanoid())` and validate the wire with `.zod((s) => s.nanoid())`. */
export function nanoid(size = 21): string {
  const alphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = "";
  for (let i = 0; i < size; i++) id += alphabet[bytes[i] & 63];
  return id;
}

/** Bound a `mode:"timestamp"` column's zod (a `ZodDate`) by EPOCH-MS values — ergonomic `min`/`max` on a Date column WITHOUT
 *  making it an integer: `createdAt.zod((s) => msRange(s, { min: 0 }).meta({…}))`. The bounds ride into the DB `Date` schema
 *  AND (via {@link wireDto}, which reads them back) onto the wire epoch-ms number. */
export function msRange(s: z.ZodDate, opts: { min?: number; max?: number }): z.ZodDate {
  let out = s;
  if (opts.min !== undefined) out = out.min(new Date(opts.min), `Must be on/after ${new Date(opts.min).toISOString()}.`);
  if (opts.max !== undefined) out = out.max(new Date(opts.max), `Must be on/before ${new Date(opts.max).toISOString()}.`);
  return out;
}

/** Read a `z.date()`'s `.min/.max` checks as epoch-ms bounds (zod v4 stores them in `_zod.def.checks` as `Date` values), so
 *  {@link wireDto} can carry a timestamp column's bounds onto the projected epoch-ms number. */
function dateBoundsMs(dateSchema: z.ZodType): { min?: number; max?: number; minInclusive?: boolean; maxInclusive?: boolean } {
  const checks = (dateSchema as unknown as { _zod?: { def?: { checks?: unknown[] } } })._zod?.def?.checks ?? [];
  const out: { min?: number; max?: number; minInclusive?: boolean; maxInclusive?: boolean } = {};
  for (const c of checks) {
    const cd = (c as { _zod?: { def?: { check?: string; inclusive?: boolean; value?: unknown } } })._zod?.def;
    if (!cd) continue;
    const v = cd.value instanceof Date ? cd.value.getTime() : typeof cd.value === "number" ? cd.value : undefined;
    if (v === undefined) continue;
    if (cd.check === "greater_than") { out.min = v; out.minInclusive = cd.inclusive; }
    else if (cd.check === "less_than") { out.max = v; out.maxInclusive = cd.inclusive; }
  }
  return out;
}

/** In the wire DTO, drizzle `mode:"timestamp"` `Date` columns become epoch-ms `number`s. */
type DatesToMs<O> = { [K in keyof O]: O[K] extends Date ? number : O[K] };
/**
 * Derive a module's WIRE DTO from its SELECT schema in ONE call — every `Date` field (drizzle `mode:"timestamp"`) is projected
 * to an epoch-ms `z.number().int()`, CARRYING that field's co-located `.zod()` meta (description/examples), and the entity
 * `.meta()` is preserved. So a schema never hand-writes `.omit({createdAt,updatedAt}).extend({…})`: add a timestamp column
 * (annotate it once with `.zod(s => s.meta({…}))`) and the wire DTO + its `z.infer` type update automatically. Non-date
 * fields pass through unchanged. `type Item = z.infer<ReturnType<typeof wireDto>>` is the DTO with `Date`→`number`.
 */
export function wireDto<T extends z.ZodType>(select: T): z.ZodType<DatesToMs<z.infer<T>>> {
  const shape = (select as unknown as { shape?: Record<string, z.ZodType> }).shape ?? {};
  const out: Record<string, z.ZodType> = {};
  for (const [key, field] of Object.entries(shape)) {
    if (field instanceof z.ZodDate) {
      // project Date → epoch-ms number, carrying the field's `.zod()` meta AND its Date `.min/.max` bounds (as epoch-ms).
      let num: z.ZodNumber = z.number().int();
      const b = dateBoundsMs(field);
      if (b.min !== undefined) num = b.minInclusive === false ? num.gt(b.min) : num.min(b.min);
      if (b.max !== undefined) num = b.maxInclusive === false ? num.lt(b.max) : num.max(b.max);
      const meta = (field as { meta?: () => Record<string, unknown> | undefined }).meta?.();
      out[key] = meta ? num.meta(meta) : num.meta({ description: "Epoch milliseconds." });
    } else {
      out[key] = field;
    }
  }
  let obj: z.ZodObject = z.object(out);
  // carry the entity-level `.meta()` (from the table-level `.zod()`) onto the DTO so the response description bubbles.
  const entityMeta = (select as unknown as { meta?: () => Record<string, unknown> | undefined }).meta?.();
  if (entityMeta) obj = obj.meta(entityMeta);
  return obj as unknown as z.ZodType<DatesToMs<z.infer<T>>>;
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
