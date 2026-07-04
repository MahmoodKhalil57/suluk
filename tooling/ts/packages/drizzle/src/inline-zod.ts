/**
 * Inline zod on drizzle columns — co-locate a column's wire refinement WITH its DDL, then read the whole
 * table back as ONE annotated zod object to slice arbitrary operations from.
 *
 * The existing chain ({@link ./schemas.ts}) takes the per-field zod as a SEPARATE `refine` object handed to
 * drizzle-zod. This module adds a `.zod(refiner)` method to every SQLite column builder so the refinement
 * lives ON the column:
 *
 *   const todo = sqliteTable("todo", {
 *     id: text("id").primaryKey().zod(s => s.describe("The todo id.").meta({ examples: ["a3a2…"] })),
 *     title: text("title").notNull().zod(s => s.min(1).max(500).meta({ description: "The todo text." })),
 *     userId: text("userId").notNull().zod(() => userTable.shape.userId),   // reuse another table's field
 *     completed: integer("completed", { mode: "boolean" }).notNull().default(false)
 *       .zod(s => s.meta({ description: "Whether the todo is done." })),
 *   });
 *   const Todo = tableZod(todo, { describe: "The todo." });   // the COMPLETE annotated row schema
 *   const CreateReq = Todo.pick({ title: true });             // ← any operation, CRUD or not…
 *   const Toggle    = Todo.pick({ id: true, completed: true }); // …sliced off the one source of truth
 *
 * MECHANISM (proven; no drizzle internals beyond one documented, public seam):
 *   - `.zod(refiner)` stashes the refiner on the column builder's runtime `config` under a Symbol and returns
 *     `this` — the value stays a genuine drizzle builder, so `sqliteTable` accepts it and the chain continues.
 *     The stash survives the build and is read back off the built column via the public `getTableColumns`.
 *   - {@link tableZod} collects the refiners and hands them to drizzle-zod's own
 *     `createSelectSchema(table, refine)`, so drizzle-zod performs ALL of the DB→zod base mapping
 *     (required / nullable / default). We only overlay the co-located refinements — we never re-derive it.
 *
 * The refiner IS the drizzle-zod refine callback: it receives the column's drizzle-zod base schema and
 * returns the refined one. Return an UNRELATED schema to reuse another table's field (`() => user.shape.id`)
 * — the FK-consistency trick. Trade-off vs. the separate `refine` object: the co-located `s` is typed only
 * by drizzle's coarse `dataType` (string→ZodString, …), not the exact per-column zod. CANDIDATE tooling.
 */
import { getTableColumns, type Table } from "drizzle-orm";
import { SQLiteColumnBuilder } from "drizzle-orm/sqlite-core/columns/common";
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import { createSelectSchema, createInsertSchema, createUpdateSchema, type BuildSchema } from "drizzle-zod";
import { z } from "zod";
import type { AnyTable } from "./meta";

/** Map drizzle's coarse `dataType` to the zod base a refiner receives — enough to expose `.min`/`.gt`/etc.
 *  without threading drizzle-zod's exact per-column type. Enum/branded columns fall back to the coarse type. */
type ZodForData<D> = D extends "string"
  ? z.ZodString
  : D extends "number" | "bigint"
    ? z.ZodNumber
    : D extends "boolean"
      ? z.ZodBoolean
      : D extends "date"
        ? z.ZodDate
        : z.ZodType;

/** The drizzle-zod refine callback: the column's base schema in → the refined schema out. Returning an
 *  unrelated schema (e.g. another table's `.shape.x`) reuses that field's zod verbatim (FK reuse). */
export type ZodRefiner<D = unknown> = (schema: ZodForData<D>) => z.ZodType;

/** Where the co-located refiner rides on the column builder's runtime config (survives `sqliteTable`). */
const ZOD_REFINER = Symbol.for("suluk.drizzle.inlineZod");

declare module "drizzle-orm/sqlite-core/columns/common" {
  interface SQLiteColumnBuilder {
    /**
     * Co-locate this column's zod refinement. `refiner` receives the drizzle-zod base schema for the column
     * (typed by drizzle's coarse `dataType`) and returns the refined one; omit it to simply MARK the column
     * (identity refine). Returns `this`, so the drizzle chain and `sqliteTable` are unaffected. Read back by
     * {@link tableZod} / {@link tableZodSchemas}.
     */
    zod(refiner?: ZodRefiner<this["_"]["dataType"]>): this;
  }
}

// Install once, idempotently, as an import side effect. `package.json` sets no `sideEffects:false`, so
// bundlers keep it; and because ESM evaluates a module's imports before its body, any schema file that
// imports `tableZod` has `.zod()` installed before its own `sqliteTable(...)` definitions run.
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

// TABLE-LEVEL `.zod()` — the same seam ONE level up: `sqliteTable(…).zod(s => s.meta({ description }))` co-locates the ENTITY
// refinement (the whole-object `.meta()`/`.describe()`) WITH the table. Read back by `tableZod`/`tableZodSchemas` and applied
// to the SELECT object. Stored in a WeakMap (never mutating drizzle's table object).
type TableEntityRefiner = (schema: z.ZodType) => z.ZodType;
const tableEntityRefiners = new WeakMap<object, TableEntityRefiner>();
const zodSchemaCache = new WeakMap<object, unknown>();
/** The precise SELECT zod-object type for a drizzle table `T` — its columns handed to drizzle-zod's `BuildSchema` (the SAME
 *  path `createSelectSchema` uses, so `z.infer<typeof table.zodSchema>` is the exact row). A helper (not `this["_"]["columns"]`
 *  inline) because `this`-indexing is disallowed in a nested type arg. */
type TableSelectSchema<T extends Table> = BuildSchema<"select", T["_"]["columns"], undefined, undefined>;
declare module "drizzle-orm/sqlite-core" {
  interface SQLiteTable {
    /**
     * Co-locate this TABLE's entity-level zod refinement (the whole-object `.meta()`/`.describe()`) AND expose the MASTER
     * `zodSchema` on the returned table — the annotated SELECT projection (columns' `.zod()` + this entity refinement), read
     * STATICALLY and PRECISELY typed per-table. `z.infer<typeof table.zodSchema>` is the exact row; slice ops off it. Returned
     * as an INTERSECTION (via a generic `this: Self`) so the table stays assignable to drizzle's query builders.
     */
    zod<Self extends Table>(this: Self, refiner: (schema: z.ZodType) => z.ZodType): Self & { readonly zodSchema: TableSelectSchema<Self> };
  }
}
if (!Object.prototype.hasOwnProperty.call(SQLiteTable.prototype, "zod")) {
  Object.defineProperty(SQLiteTable.prototype, "zod", {
    value: function (this: object, refiner: TableEntityRefiner) {
      tableEntityRefiners.set(this, refiner);
      return this;
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}
if (!Object.prototype.hasOwnProperty.call(SQLiteTable.prototype, "zodSchema")) {
  Object.defineProperty(SQLiteTable.prototype, "zodSchema", {
    // the MASTER schema — memoized, referentially stable. Runtime = the annotated select object (`tableZod(this)`).
    get(this: AnyTable) {
      let cached = zodSchemaCache.get(this);
      if (!cached) { cached = tableZod(this); zodSchemaCache.set(this, cached); }
      return cached;
    },
    configurable: true,
    enumerable: false,
  });
}

/** Apply a table's chained `.zod()` entity refiner to its SELECT object IN-PLACE via the global registry — reading the
 *  refiner's `.meta()` off a throwaway clone (both casts through `unknown`) so the precise select type is preserved (applying
 *  a function in the typed position forces drizzle-zod's deep type → TS2589). No-op if the table has no chained `.zod()`. */
function registerEntity(table: AnyTable, select: object): void {
  const entity = tableEntityRefiners.get(table);
  if (!entity) return;
  const meta = (entity(select as unknown as z.ZodType) as { meta?: () => Record<string, unknown> | undefined }).meta?.();
  if (meta) z.globalRegistry.add(select as unknown as z.ZodType, meta);
}

/** Collect the co-located refiners off a built table's columns, keyed by JS property name. */
function collectRefiners(table: AnyTable): Record<string, ZodRefiner> {
  const refine: Record<string, ZodRefiner> = {};
  for (const [key, col] of Object.entries(getTableColumns(table))) {
    // `config` is `protected` on drizzle's Column type; reach it through `unknown` (present at runtime).
    const r = (col as unknown as { config?: Record<string | symbol, unknown> }).config?.[ZOD_REFINER];
    if (typeof r === "function") refine[key] = r as ZodRefiner;
  }
  return refine;
}

export interface TableZodOptions {
  /** entity-level description for the whole object (becomes the schema's `.describe(...)`). */
  describe?: string;
}

/**
 * Rebuild a table as ONE zod object carrying every column's co-located `.zod()` refinement — the "complete
 * zod schema for the table" you slice operations from. Delegates the DB→zod base mapping to drizzle-zod's
 * `createSelectSchema`; the collected refiners are its `refine` argument. Types are inferred, so
 * `z.infer<ReturnType<typeof tableZod>>` is the exact row shape.
 */
export function tableZod<T extends AnyTable>(table: T, opts: TableZodOptions = {}) {
  // drizzle-zod types `refine` to the table's KNOWN column keys; our map is built from the SAME columns, so
  // it is key-correct at runtime — we cast through the structural mismatch at this one boundary only.
  const select = createSelectSchema(table, collectRefiners(table) as never);
  // entity annotation: `opts.describe` wins; else the chained table-level `.zod()` refiner (registered in-place).
  if (opts.describe) return select.describe(opts.describe) as typeof select;
  registerEntity(table, select);
  return select;
}

/**
 * The three drizzle-zod projections (select / insert / update), each carrying the co-located refinements —
 * the inline `.meta()` + constraints ride into ALL of them. A drop-in, co-located upgrade of
 * {@link ./schemas.ts}'s `tableSchemas`: define the zod once ON the columns instead of in a separate object.
 */
export function tableZodSchemas<T extends AnyTable>(table: T, opts: TableZodOptions = {}) {
  const refine = collectRefiners(table) as never;
  const select = createSelectSchema(table, refine);
  if (!opts.describe) registerEntity(table, select);
  return {
    select: (opts.describe ? select.describe(opts.describe) : select) as typeof select,
    insert: createInsertSchema(table, refine),
    update: createUpdateSchema(table, refine),
  };
}

/** In the wire DTO, drizzle `mode:"timestamp"` `Date` columns become epoch-ms `number`s. */
type DatesToMs<O> = { [K in keyof O]: O[K] extends Date ? number : O[K] };
/**
 * Derive a WIRE DTO from a SELECT schema in ONE call — every `Date` field (drizzle `mode:"timestamp"`) is projected to an
 * epoch-ms `z.number().int()`, CARRYING that field's co-located `.zod()` meta (description/examples), and the entity `.meta()`
 * is preserved. So a module never hand-writes `.omit({createdAt,updatedAt}).extend({…})`: annotate the timestamp column once
 * and the DTO + its `z.infer` type update automatically. Non-date fields pass through. Pairs with {@link tableZod}/`tableZodSchemas`.
 */
export function wireDto<T extends z.ZodType>(select: T): z.ZodType<DatesToMs<z.infer<T>>> {
  const shape = (select as unknown as { shape?: Record<string, z.ZodType> }).shape ?? {};
  const out: Record<string, z.ZodType> = {};
  for (const [key, field] of Object.entries(shape)) {
    if (field instanceof z.ZodDate) {
      const meta = (field as { meta?: () => Record<string, unknown> | undefined }).meta?.();
      out[key] = meta ? z.number().int().meta(meta) : z.number().int().meta({ description: "Epoch milliseconds." });
    } else {
      out[key] = field;
    }
  }
  let obj: z.ZodObject = z.object(out);
  const entityMeta = (select as unknown as { meta?: () => Record<string, unknown> | undefined }).meta?.();
  if (entityMeta) obj = obj.meta(entityMeta);
  return obj as unknown as z.ZodType<DatesToMs<z.infer<T>>>;
}
