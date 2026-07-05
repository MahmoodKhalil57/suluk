/**
 * List query-param synthesis (C114 extends saastarter-parity Phase 1). The list route today returns the whole
 * collection; real lists are paginated, sortable, filterable, searchable — and a real "auto table" (an admin/panel
 * grid rendered straight off the contract) needs BOTH a simple per-field mode (flat query params any UI can emit
 * without a query-builder) and a thorough advanced mode (a real nested boolean filter TREE — Splunk-parity search,
 * not just flat equality) that is itself JSON-Schema-describable (so it shows up in the v4 doc + SDK precisely,
 * not as an opaque string param).
 *
 *   SIMPLE   — flat query params: `title=milk` (eq) or `title__contains=milk` (Django-lookup-style operator
 *              suffix), implicitly AND'd. Easy to type in a URL bar or emit from a basic filter-row UI.
 *   ADVANCED — one JSON-encoded `filter` param carrying a {@link FilterNode}: a recursive tree of leaf
 *              {@link FilterCondition}s composed with `and`/`or`/`not`. This is the Splunk-parity mode — full
 *              boolean nesting, not just a flat AND — and because it's a real Zod type (not a hand-rolled string
 *              grammar), `zodToV4` projects it into a precise, recursive JSON Schema ($defs + $ref) the v4 doc/SDK
 *              can render exactly, instead of documenting it as "a string, format unspecified."
 *
 * Both modes compile down to the SAME safe primitive: every leaf condition's value is a BOUND drizzle parameter
 * (`eq`/`gt`/`like`/`inArray`/…, never string-concatenated SQL) and every `field` is checked against the table's
 * REAL columns before use — an unrecognized field/op is a loud error (`compileFilter` throws), never a silently
 * dropped or silently widened clause.
 */
import * as z from "zod";
import { and, or, not, eq, ne, gt, gte, lt, lte, sql, inArray, notInArray, isNull, isNotNull, asc, desc, getTableColumns, type SQL, type Column } from "drizzle-orm";
import { tableMetadata, type AnyTable } from "./meta";

export interface ListQueryOptions {
  /** sortable + filterable columns (default: all of the table's columns). */
  columns?: string[];
  /** default page size (default 20). */
  defaultPerPage?: number;
  /** max page size — `perPage` is clamped to it (default 100). */
  maxPerPage?: number;
  /** columns the free-text `q` search matches against (default: every `dataType: "string"` column). */
  searchColumns?: string[];
  /** max total nodes (leaves + and/or/not wrappers) an advanced `filter` tree may have (default 200) — SQLite (and
   *  D1) rejects a compiled expression past a few hundred/thousand nodes with "Expression tree is too large", an
   *  execution-time failure `compileFilter`'s own dataType checks can't catch (the tree is 100% schema-valid); a
   *  caller-sized tree is rejected at VALIDATION time instead, well before it ever reaches SQL. */
  maxFilterNodes?: number;
}

/** Reserved query keys (everything else that matches a column, or `column__op`, becomes a simple-mode filter). */
const RESERVED = new Set(["page", "perPage", "sort", "order", "q", "filter"]);

// ── the closed, safe operator vocabulary — every op below maps to a real bound drizzle condition, never raw SQL ──

export type FilterOp =
  | "eq" | "ne"
  | "gt" | "gte" | "lt" | "lte"
  | "contains" | "startsWith" | "endsWith"
  | "in" | "notIn"
  | "isNull" | "isNotNull";

export const FILTER_OPS: readonly FilterOp[] = [
  "eq", "ne", "gt", "gte", "lt", "lte", "contains", "startsWith", "endsWith", "in", "notIn", "isNull", "isNotNull",
];

/** Which ops are semantically valid per drizzle's coarse `dataType` — e.g. `contains` on a boolean column is
 *  rejected rather than silently coerced into something meaningless. Unknown dataTypes get the full vocabulary
 *  (honest default: don't invent a narrower rule than the table actually declares). */
const OPS_BY_DATA_TYPE: Readonly<Record<string, readonly FilterOp[]>> = {
  string: ["eq", "ne", "contains", "startsWith", "endsWith", "in", "notIn", "isNull", "isNotNull"],
  number: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "notIn", "isNull", "isNotNull"],
  boolean: ["eq", "ne", "isNull", "isNotNull"],
  date: ["eq", "ne", "gt", "gte", "lt", "lte", "isNull", "isNotNull"],
};

/** One leaf condition: `field OP value` (`value` omitted for `isNull`/`isNotNull`; an array for `in`/`notIn`). */
export interface FilterCondition {
  field: string;
  op: FilterOp;
  value?: unknown;
}

/** A filter TREE — a leaf condition, or `and`/`or`/`not` composing sub-trees. Recursive, hence JSON-Schema
 *  describable via `$defs`/`$ref` (zodToV4 projects `z.lazy` recursion exactly this way) rather than opaque. */
export type FilterNode = FilterCondition | { and: FilterNode[] } | { or: FilterNode[] } | { not: FilterNode };

/** Total node count (leaves + `and`/`or`/`not` wrappers) in a {@link FilterNode} tree. */
function countFilterNodes(n: FilterNode): number {
  if ("and" in n) return 1 + n.and.reduce((sum, c) => sum + countFilterNodes(c), 0);
  if ("or" in n) return 1 + n.or.reduce((sum, c) => sum + countFilterNodes(c), 0);
  if ("not" in n) return 1 + countFilterNodes(n.not);
  return 1;
}

/** The Zod schema for a {@link FilterNode}, scoped to `table`'s real columns (or `opts.columns`) — an unrecognized
 *  `field` or `op` fails VALIDATION (a typed 400), not a silent no-op; a tree past `opts.maxFilterNodes` (default
 *  200) fails validation too (see the option's own doc — the DB engine's expression-depth limit is an execution-
 *  time failure this schema-level bound heads off). Exported so a route can declare the `filter` query param's
 *  true shape (e.g. for a request BODY carrying a filter instead of a query string). */
export function filterNodeSchema(table?: AnyTable, opts: ListQueryOptions = {}): z.ZodType<FilterNode> {
  const cols = opts.columns ?? (table ? tableMetadata(table).columns.map((c) => c.name) : []);
  const field = cols.length ? z.enum(cols as [string, ...string[]]) : z.string();
  const condition = z.object({
    field,
    op: z.enum(FILTER_OPS as [FilterOp, ...FilterOp[]]),
    value: z.unknown().optional(),
  });
  const node: z.ZodType<FilterNode> = z.lazy(() =>
    z.union([
      condition,
      z.object({ and: z.array(node).min(1) }),
      z.object({ or: z.array(node).min(1) }),
      z.object({ not: node }),
    ]),
  );
  const maxNodes = opts.maxFilterNodes ?? 200;
  return node.refine((n) => countFilterNodes(n) <= maxNodes, { message: `filter has too many conditions (max ${maxNodes}).` });
}

/** The Zod query schema for a list route: `page`/`perPage`/`sort`/`order`/`q` (SIMPLE mode; coerced from strings)
 *  + `filter` (ADVANCED mode: a JSON-encoded {@link FilterNode}, validated by {@link filterNodeSchema} at parse
 *  time — declared here only as a string, since a querystring param is inherently flat text). Per-column
 *  `column`/`column__op` simple filters aren't enumerable here (OpenAPI query params are flat) — read at runtime
 *  by {@link parseListQuery}. `table` is OPTIONAL: without one (or `opts.columns`), the field vocabulary stays a
 *  free string, so a Zod-entity-only caller (no Drizzle table) still gets the same param shape. */
export function listQuerySchema(table?: AnyTable, opts: ListQueryOptions = {}): z.ZodType {
  return z.object({
    page: z.coerce.number().int().min(1).optional(),
    perPage: z.coerce.number().int().min(1).optional(),
    /** comma-separated column list, each optionally `-`-prefixed for descending (`sort=-createdAt,title`); a bare
     *  `sort=col` + `order=asc|desc` (the Phase-1 shape) still works — `order` is the fallback direction for any
     *  token without its own `-` prefix. */
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    /** free-text search across every string column (or `opts.searchColumns`) — an OR of `contains` matches. */
    q: z.string().optional(),
    /** ADVANCED mode: a JSON-encoded {@link FilterNode}. When present, SIMPLE per-column params are ignored (no
     *  ambiguous merge of two filter mechanisms) — use `filterNodeSchema(table)` to validate/document the real shape. */
    filter: z.string().optional().meta({
      description: "A JSON-encoded recursive filter tree: a leaf { field, op, value } composed with and/or/not — " +
        "see filterNodeSchema's own schema for the exact recognized fields/ops.",
      examples: [JSON.stringify({ and: [{ field: "title", op: "contains", value: "milk" }, { not: { field: "completed", op: "eq", value: true } }] })],
    }),
  });
}

export interface SortSpec {
  column: string;
  dir: "asc" | "desc";
}

export interface ListQuery {
  /** rows to return (= perPage). */
  limit: number;
  /** rows to skip (= (page-1)*perPage). */
  offset: number;
  /** @deprecated single-column form, kept for existing callers (e.g. `@suluk/drizzle`'s own `crudHandlers`) — equals `sort[0]`. */
  orderBy?: { column: string; dir: "asc" | "desc" };
  /** every sort column in order (multi-column; empty when none requested). */
  sort: SortSpec[];
  /** free-text search term (SIMPLE mode). */
  q?: string;
  /** @deprecated column → equality value (SIMPLE mode, `eq` only) — kept for existing callers; superseded by `filter`. */
  filters: Record<string, string>;
  /** the full resolved filter (SIMPLE mode's per-column/per-op params folded into an implicit AND, OR the
   *  ADVANCED `filter` JSON param if one was given — never both merged, to avoid an ambiguous combination).
   *  `undefined` when no filter was requested. */
  filter?: FilterNode;
  page: number;
  perPage: number;
}

type RawQuery = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const intOr = (v: string | undefined, fallback: number) => {
  const n = v == null ? NaN : parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

/** Parse `sort=-createdAt,title` (or the legacy single `sort=col`+`order=`) into ordered {@link SortSpec}s,
 *  keeping only real columns (an unrecognized token is dropped, never widened into a raw SQL identifier). */
function parseSort(rawSort: string | undefined, rawOrder: string | undefined, colSet: ReadonlySet<string>): SortSpec[] {
  if (!rawSort) return [];
  const fallbackDir = rawOrder === "desc" ? "desc" : "asc";
  const out: SortSpec[] = [];
  for (const token of rawSort.split(",").map((t) => t.trim()).filter(Boolean)) {
    const isDesc = token.startsWith("-");
    const column = isDesc ? token.slice(1) : token;
    if (!colSet.has(column)) continue;
    out.push({ column, dir: isDesc ? "desc" : fallbackDir });
  }
  return out;
}

/** Parse every `column` / `column__op` simple-mode query key into an implicit-AND {@link FilterNode} — `undefined`
 *  when none are present. Values for `in`/`notIn` are comma-split; every other op takes the raw string verbatim
 *  (numeric/boolean coercion happens once, safely, inside {@link compileFilter} against the column's real type). */
function parseSimpleFilters(raw: RawQuery, colSet: ReadonlySet<string>): { filter?: FilterNode; filters: Record<string, string> } {
  const conditions: FilterCondition[] = [];
  const filters: Record<string, string> = {}; // legacy `filters` shape: eq-only, single value
  for (const [key, v] of Object.entries(raw)) {
    if (RESERVED.has(key)) continue;
    const val = first(v);
    if (val == null) continue;
    const sep = key.indexOf("__");
    const field = sep === -1 ? key : key.slice(0, sep);
    const opToken = sep === -1 ? "eq" : key.slice(sep + 2);
    if (!colSet.has(field) || !(FILTER_OPS as readonly string[]).includes(opToken)) continue;
    const op = opToken as FilterOp;
    if (op === "eq") filters[field] = val;
    conditions.push({
      field,
      op,
      ...(op === "isNull" || op === "isNotNull" ? {} : op === "in" || op === "notIn" ? { value: val.split(",").map((s) => s.trim()) } : { value: val }),
    });
  }
  if (conditions.length === 0) return { filters };
  return { filter: conditions.length === 1 ? conditions[0] : { and: conditions }, filters };
}

/**
 * Normalize a raw query object into a {@link ListQuery} — pure, validating against the table's real columns:
 * page/perPage are clamped (≥1, ≤maxPerPage); `sort` tokens are honored only for real columns; SIMPLE-mode
 * `column`/`column__op` params fold into an implicit-AND `filter`, UNLESS the ADVANCED `filter` JSON param is
 * present (parsed + validated via {@link filterNodeSchema} — an invalid tree throws, a typed 400 upstream), in
 * which case the simple params are ignored entirely (no ambiguous merge of the two filter mechanisms).
 */
export function parseListQuery(raw: RawQuery, table: AnyTable, opts: ListQueryOptions = {}): ListQuery {
  const colSet = new Set(opts.columns ?? tableMetadata(table).columns.map((c) => c.name));
  const defaultPer = opts.defaultPerPage ?? 20;
  const maxPer = opts.maxPerPage ?? 100;

  const page = Math.max(1, intOr(first(raw.page), 1));
  const perPage = Math.min(maxPer, Math.max(1, intOr(first(raw.perPage), defaultPer)));

  const sort = parseSort(first(raw.sort), first(raw.order), colSet);
  const q = first(raw.q) || undefined;

  const rawFilter = first(raw.filter);
  let filter: FilterNode | undefined;
  let filters: Record<string, string> = {};
  if (rawFilter) {
    const parsed: unknown = JSON.parse(rawFilter);
    filter = filterNodeSchema(table, opts).parse(parsed);
  } else {
    const simple = parseSimpleFilters(raw, colSet);
    filter = simple.filter;
    filters = simple.filters;
  }

  return {
    limit: perPage,
    offset: (page - 1) * perPage,
    ...(sort[0] ? { orderBy: sort[0] } : {}),
    sort,
    ...(q ? { q } : {}),
    filters,
    ...(filter ? { filter } : {}),
    page,
    perPage,
  };
}

// ── COMPILE — turn a validated FilterNode / sort spec into REAL, bound drizzle SQL. Every value is a parameter;
//    every field is resolved off the table's own real column object, never a raw identifier string. ──────────────

/** Escape LIKE wildcards (`%`/`_`) in a literal search value so `contains`/`startsWith`/`endsWith` match the
 *  value verbatim rather than treating the caller's own `%`/`_` characters as SQL wildcards. Mirrors the same
 *  escape used by the registry's `logs` module (`logs.service.ts`'s `escapeLike`). */
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** A bound, ESCAPE-aware LIKE — drizzle's own `like()` helper emits a plain `LIKE` with NO escape clause, so an
 *  escaped `\%`/`\_` in the pattern would be matched LITERALLY (backslash and all) instead of as an escaped
 *  wildcard; the explicit `ESCAPE '\'` here is what makes {@link escapeLike}'s escaping actually take effect. */
function likeEscaped(col: Column, pattern: string): SQL {
  return sql`${col} LIKE ${pattern} ESCAPE '\\'`;
}

/** Compile one leaf {@link FilterCondition} into a bound drizzle `SQL` condition against `col`. */
function compileCondition(col: Column, op: FilterOp, value: unknown): SQL {
  switch (op) {
    case "eq": return eq(col, value);
    case "ne": return ne(col, value);
    case "gt": return gt(col, value);
    case "gte": return gte(col, value);
    case "lt": return lt(col, value);
    case "lte": return lte(col, value);
    case "contains": return likeEscaped(col, `%${escapeLike(String(value))}%`);
    case "startsWith": return likeEscaped(col, `${escapeLike(String(value))}%`);
    case "endsWith": return likeEscaped(col, `%${escapeLike(String(value))}`);
    case "in": return inArray(col, Array.isArray(value) ? value : [value]);
    case "notIn": return notInArray(col, Array.isArray(value) ? value : [value]);
    case "isNull": return isNull(col);
    case "isNotNull": return isNotNull(col);
  }
}

/**
 * Compile a validated {@link FilterNode} into a real, bound drizzle `SQL` condition — `undefined` for a
 * degenerate empty tree. Throws a plain `Error` (render it as a typed 400 at the route boundary — the field/op
 * vocabulary was already validated by {@link filterNodeSchema}, so this only fires for a field/op combination the
 * TABLE doesn't support, e.g. `contains` on a boolean column) rather than silently dropping the clause.
 */
export function compileFilter(table: AnyTable, node: FilterNode, opts: ListQueryOptions = {}): SQL | undefined {
  const meta = tableMetadata(table);
  const colSet = new Set(opts.columns ?? meta.columns.map((c) => c.name));
  const dataTypeOf = new Map(meta.columns.map((c) => [c.name, c.dataType]));
  const cols = getTableColumns(table) as unknown as Record<string, Column>;

  function compile(n: FilterNode): SQL | undefined {
    if ("and" in n) return and(...n.and.map(compile).filter((x): x is SQL => x !== undefined));
    if ("or" in n) return or(...n.or.map(compile).filter((x): x is SQL => x !== undefined));
    if ("not" in n) { const inner = compile(n.not); return inner ? not(inner) : undefined; }
    const { field, op, value } = n;
    if (!colSet.has(field)) throw new Error(`compileFilter: "${field}" is not a filterable column.`);
    const allowed = OPS_BY_DATA_TYPE[dataTypeOf.get(field) ?? ""] ?? FILTER_OPS;
    if (!allowed.includes(op)) throw new Error(`compileFilter: "${op}" is not valid for column "${field}" (${dataTypeOf.get(field)}).`);
    return compileCondition(cols[field]!, op, value);
  }
  return compile(node);
}

/** Compile {@link SortSpec}s into real `.orderBy(...)` arguments, in order — an unrecognized column (already
 *  filtered out by {@link parseSort}) never reaches here. */
export function compileSort(table: AnyTable, sort: readonly SortSpec[], opts: ListQueryOptions = {}): SQL[] {
  const colSet = new Set(opts.columns ?? tableMetadata(table).columns.map((c) => c.name));
  const cols = getTableColumns(table) as unknown as Record<string, Column>;
  return sort.filter((s) => colSet.has(s.column)).map((s) => (s.dir === "desc" ? desc(cols[s.column]!) : asc(cols[s.column]!)));
}

/** Compile a free-text `q` into an OR of `contains` matches across every eligible string column — `undefined`
 *  when `q` is empty or no string column is eligible (never a query that accidentally matches every row). */
export function compileTextSearch(table: AnyTable, q: string | undefined, opts: ListQueryOptions = {}): SQL | undefined {
  if (!q) return undefined;
  const meta = tableMetadata(table);
  const searchable = opts.searchColumns ?? meta.columns.filter((c) => c.dataType === "string").map((c) => c.name);
  const cols = getTableColumns(table) as unknown as Record<string, Column>;
  const conds = searchable.filter((name) => cols[name]).map((name) => likeEscaped(cols[name]!, `%${escapeLike(q)}%`));
  return conds.length ? or(...conds) : undefined;
}

export interface ResolvedListQuery {
  where: SQL;
  orderBy: SQL[];
  limit: number;
  offset: number;
}

/**
 * The one-call list-query primitive: `parseListQuery` + `compileFilter`/`compileTextSearch`/`compileSort`, ANY
 * failure among them (a malformed advanced `filter=`, or a syntactically-valid-but-dataType-invalid op —
 * `compileFilter` deliberately throws for that) caught and resolved to `scope`/`defaultOrderBy`/a default page —
 * never a 500. `scope` is ALWAYS the outermost `and()` term, on both the happy path and the fallback — a
 * caller-supplied filter can never widen past it. Model authors reach for this instead of hand-rolling the
 * parse/compile/fallback chain per table (C116: that chain, once hand-rolled per model, is exactly where a
 * dataType/op-mismatch bug hid until adversarially found).
 */
export function resolveListQuery(
  table: AnyTable,
  raw: RawQuery,
  scope: SQL,
  defaultOrderBy: SQL[],
  opts: ListQueryOptions = {},
): ResolvedListQuery {
  try {
    const lq = parseListQuery(raw, table, opts);
    const filterCond = lq.filter ? compileFilter(table, lq.filter, opts) : undefined;
    const searchCond = compileTextSearch(table, lq.q, opts);
    const where = and(scope, ...[filterCond, searchCond].filter((c): c is SQL => c !== undefined)) ?? scope;
    const orderBy = lq.sort.length ? compileSort(table, lq.sort, opts) : defaultOrderBy;
    return { where, orderBy, limit: lq.limit, offset: lq.offset };
  } catch {
    return { where: scope, orderBy: defaultOrderBy, limit: opts.defaultPerPage ?? 20, offset: 0 };
  }
}
