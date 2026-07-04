/**
 * `withZod` — run a drizzle query and get BOTH the `rows` AND a `schema`: a zod object DERIVED from the EXACT fields the query
 * projects, each field carrying its column's co-located `.zod()` refinement. So a select/insert declares its own response
 * contract with NOTHING restated — the schema mirrors the rows exactly (a `mode:"timestamp"` column stays `z.date()`):
 *
 *   const { schema, rows } = await withZod(
 *     db.select({ title: todo.title, completed: todo.completed }).from(todo).where(owned(userId, id)).limit(1));
 *   //  schema = z.object({ title: <todo.title's .zod()>, completed: <todo.completed's .zod()> })
 *   //  rows   = { title: string; completed: boolean }[]        — z.infer<schema> === a row, exactly
 *
 *   const { schema, rows } = await withZod(db.insert(todo).values({ … }).returning());
 *   //  schema = todo.zodSchema  (a FULL-table projection returns the master: entity `.describe()` + db.<t>.<f> $refs)
 *
 * The projection is read off the query itself (`config.fields` for a select; `config.returning` for insert/update/delete),
 * so nothing is passed twice. A Column maps to its refined field (matched by identity in its own table); an SQL-expression
 * field (an aggregate — not a Column) falls back to `z.unknown()`.
 */
import { getTableColumns, is, Column, type Table } from "drizzle-orm";
import { z } from "zod";
// Side-effect import: loads inline-zod so the `.zod()` column/table augmentation + the memoized `zodSchema` getter are installed
// before we read a table's `.zodSchema` below. (Calling `tableZod()` directly here would drag its deep drizzle-zod return type
// into this module → TS2589; the runtime getter is the clean read.)
import "./inline-zod";

/** A drizzle query builder as we read it: awaitable, with the projection on its `config`. */
interface QueryWithConfig {
  config?: {
    fields?: Record<string, unknown>; // SELECT projection: { projKey: Column | SQL }
    returning?: { path: string[]; field: unknown }[]; // INSERT/UPDATE/DELETE `.returning()`
  };
}

/** The refined zod for one projected field + its provenance — a Column → its table's master field (matched by IDENTITY, so a
 *  renamed projection `{ t: todo.title }` still resolves `todo.title`); anything else (an SQL expression) → `z.unknown()`. */
function fieldZod(field: unknown): { zod: z.ZodType; table?: Table; jsKey?: string } {
  if (is(field, Column)) {
    const table = (field as { table?: Table }).table;
    if (table) {
      const master = (table as unknown as { zodSchema: { shape: Record<string, z.ZodType> } }).zodSchema;
      for (const [jsKey, col] of Object.entries(getTableColumns(table))) {
        if (col === field) return { zod: master.shape[jsKey] ?? z.unknown(), table, jsKey };
      }
    }
  }
  return { zod: z.unknown() };
}

/** Build the zod object for a query's projection. A FULL-table projection (every column, keys unrenamed, one table) returns
 *  that table's master `zodSchema` verbatim (entity describe + $refs); any subset/rename returns a fresh `z.object`. */
export function queryZodSchema(query: unknown): z.ZodType {
  const config = (query as QueryWithConfig).config;
  const fields: Record<string, unknown> = config?.fields
    ? config.fields
    : Array.isArray(config?.returning)
      ? Object.fromEntries(config.returning.map((r) => [r.path[r.path.length - 1], r.field]))
      : {};
  const entries = Object.entries(fields);
  const shape: Record<string, z.ZodType> = {};
  let oneTable: Table | undefined;
  let fullCandidate = entries.length > 0;
  const jsKeys = new Set<string>();
  for (const [projKey, field] of entries) {
    const { zod, table, jsKey } = fieldZod(field);
    shape[projKey] = zod;
    if (table && jsKey === projKey) {
      if (!oneTable) oneTable = table;
      else if (oneTable !== table) fullCandidate = false;
      jsKeys.add(jsKey);
    } else {
      fullCandidate = false; // an SQL field, a rename, or a cross-table join ⇒ not the master
    }
  }
  if (fullCandidate && oneTable) {
    const cols = Object.keys(getTableColumns(oneTable));
    if (cols.length === jsKeys.size && cols.every((k) => jsKeys.has(k))) {
      return (oneTable as unknown as { zodSchema: z.ZodType }).zodSchema;
    }
  }
  return z.object(shape);
}

/**
 * Run `query` and return `{ schema, rows }` — the rows AND the zod schema derived from the query's projected fields. The ROW
 * element `R` is inferred straight from the query's `PromiseLike<R[]>`, so `schema` is `z.ZodType<R>` (`z.infer<typeof schema>`
 * === a row) and `rows` is `R[]` — without expanding the deep drizzle builder type. Opt-in + additive: a plain `await query` is
 * unchanged.
 */
export async function withZod<R>(query: PromiseLike<R[]>): Promise<{ schema: z.ZodType<R>; rows: R[] }> {
  const schema = queryZodSchema(query) as unknown as z.ZodType<R>;
  const rows = await query;
  return { schema, rows };
}
