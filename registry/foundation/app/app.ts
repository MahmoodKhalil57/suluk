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
import { createSelectSchema, createInsertSchema, createUpdateSchema, type BuildRefine, type NoUnknownKeys } from "drizzle-zod";
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
declare module "drizzle-orm/sqlite-core" {
  interface SQLiteTable {
    /** Co-locate this TABLE's entity-level zod refinement (the whole-object `.meta()`/`.describe()`). Returns the table
     *  unchanged, so the drizzle chain is unaffected; read by `tableSchemas` and applied to the SELECT object schema. */
    zod(refiner: (schema: z.ZodType) => z.ZodType): this;
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
