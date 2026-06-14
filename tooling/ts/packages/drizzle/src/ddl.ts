/**
 * Emit SQLite `CREATE TABLE` DDL from a drizzle table's {@link tableMetadata} — the generator that lets a dev
 * in-memory bun:sqlite DB be built FROM the Drizzle schema instead of a hand-mirrored SQL string that silently
 * drifts. Reads only the honest metadata floor (types, notNull, defaults, PK/autoincrement); identifiers are
 * quoted so reserved words (e.g. `order`) are safe. Booleans map to INTEGER (drizzle's storage), enums to plain
 * TEXT (drizzle adds no CHECK). Prod migrations stay the source of truth for prod; this is the dev-schema twin.
 */
import { tableMetadata, type AnyTable, type ColumnMeta, type TableMeta } from "./meta";

const SQLITE_TYPE: Record<string, string> = {
  SQLiteInteger: "INTEGER", SQLiteBoolean: "INTEGER", SQLiteTimestamp: "INTEGER",
  SQLiteText: "TEXT", SQLiteTextJson: "TEXT", SQLiteReal: "REAL", SQLiteNumeric: "NUMERIC", SQLiteBlob: "BLOB",
};

/** Double-quote an identifier (table/column) so reserved words + odd names are always safe. */
const q = (id: string): string => `"${id.replace(/"/g, '""')}"`;
/** A SQL literal for a static default: booleans → 0/1, numbers verbatim, strings single-quoted. */
const lit = (v: string | number | boolean): string =>
  typeof v === "boolean" ? (v ? "1" : "0") : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;

function columnDDL(c: ColumnMeta): string {
  const parts = [q(c.sqlName), SQLITE_TYPE[c.columnType] ?? "TEXT"];
  if (c.primaryKey) parts.push(c.autoIncrement ? "PRIMARY KEY AUTOINCREMENT" : "PRIMARY KEY");
  else if (c.notNull) parts.push("NOT NULL");
  if (c.defaultValue !== undefined) parts.push("DEFAULT " + lit(c.defaultValue));
  return parts.join(" ");
}

export interface DdlOptions {
  /** prefix with `IF NOT EXISTS` (default true). */
  ifNotExists?: boolean;
}

/**
 * `CREATE TABLE` DDL for one drizzle table (or its already-read metadata). Single-column primary keys only — a
 * table-level composite `primaryKey({columns})` isn't visible on the column-descriptor floor (it needs
 * dialect-specific `getTableConfig`, deferred like FK/relation projection); such a table emits its columns without
 * the composite constraint, so declare those tables' DDL by hand for now.
 */
export function tableDDL(table: AnyTable | TableMeta, opts: DdlOptions = {}): string {
  const m: TableMeta = "columns" in table ? table : tableMetadata(table);
  const cols = m.columns.map(columnDDL).join(", ");
  const exists = opts.ifNotExists === false ? "" : "IF NOT EXISTS ";
  return `CREATE TABLE ${exists}${q(m.name)} (${cols});`;
}

/** `CREATE TABLE` DDL for many tables, newline-joined — the dev-schema twin of the prod migrations. */
export function schemaDDL(tables: (AnyTable | TableMeta)[], opts: DdlOptions = {}): string {
  return tables.map((t) => tableDDL(t, opts)).join("\n");
}
