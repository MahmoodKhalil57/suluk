/**
 * Table-level EXECUTION POLICY (C111) — the same co-location move as `.zod()` (inline-zod.ts), one concern over:
 * a table's `.policy({...})` declares the C108/C110 execution-policy facets (retry/timeout/idempotency/dedupe/
 * rate-limit) ONCE, alongside its DDL, instead of every model/route that touches this table restating them.
 *
 *   const payment = sqliteTable("payment", { id: text("id").primaryKey(), … }).policy({
 *     dedupe: { ttlMs: 60_000, keySource: { header: "Idempotency-Key" } },
 *     requiresIdempotencyKey: true,
 *     retry: { times: 3, whenErrorTags: ["ExternalServiceError"] },
 *   });
 *
 * `queryTable` reads the table a drizzle query builder centrally touches (SELECT FROM / INSERT INTO / UPDATE /
 * DELETE FROM all carry `config.table` uniformly, verified against the real drizzle-orm builders) — `../app`'s
 * `queryOne`/`queryMany`/`mutate` (the registry's model factories) use it to look up that table's `.policy()`
 * AUTOMATICALLY, with zero extra config at the call site: touching `payment` is what opts a model into its policy.
 *
 * `rateLimit`/`dedupe` are the REAL, HTTP-enforced fields (mirrors `sulukFn`'s own top-level `rateLimit`/`dedupe` —
 * `@suluk/hono`'s `enforceRateLimit`/`enforceDedupe` read them off the emitted route). `retry`/`timeoutMs` are
 * DECLARED-AND-ENFORCED too, but only once a model opts into the `x-suluk-run` graph (a labeled `node`) — the
 * SAME real `Effect.retry`/`Effect.timeoutFail` wrapping `sulukFn`'s `node.retry`/`node.timeoutMs` already give.
 * `idempotent`/`effect`/`requiresIdempotencyKey`/`idempotencyKeySource` stay DECLARED-ONLY (advisory), the same
 * honest boundary they already carry on `SulukRunNode` (C108) — a table's `.policy()` is just where they're
 * authored once, not a new enforcement mechanism.
 */
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { Table } from "drizzle-orm";
import type { SulukRateLimit, SulukDedupe } from "@suluk/core";

export interface TableExecutionPolicy {
  /** REAL, HTTP-enforced (`@suluk/hono`'s `enforceRateLimit`) once a route reads it. */
  rateLimit?: SulukRateLimit;
  /** REAL, HTTP-enforced (`@suluk/hono`'s `enforceDedupe`) once a route reads it. */
  dedupe?: SulukDedupe;
  /** DECLARED-AND-ENFORCED (`Effect.retry`/`Schedule.recurWhile`) once a model opts into a graph `node`. */
  retry?: { times: number; delayMs?: number; whenErrorTags?: string[] };
  /** DECLARED-AND-ENFORCED (`Effect.timeoutFail`) once a model opts into a graph `node`. */
  timeoutMs?: number;
  /** DECLARED-ONLY (advisory) — see `SulukRunNode.idempotent`. */
  idempotent?: boolean;
  /** DECLARED-ONLY (advisory) — see `SulukRunNode.effect`. */
  effect?: "read" | "write" | "emit";
  /** DECLARED-ONLY (advisory) — see `SulukRunNode.requiresIdempotencyKey`. */
  requiresIdempotencyKey?: boolean;
  /** DECLARED-ONLY (advisory) — see `SulukRunNode.idempotencyKeySource`. */
  idempotencyKeySource?: { header: string } | { bodyField: string };
}

const tablePolicies = new WeakMap<object, TableExecutionPolicy>();

declare module "drizzle-orm/sqlite-core" {
  interface SQLiteTable {
    /** Co-locate this table's execution policy (C111) WITH its DDL — read back by `tablePolicy` (`queryOne`/
     *  `queryMany`/`mutate` in the registry's `../app` call it automatically). Returns `this` (chainable, like
     *  `.zod()`) so it composes with the existing `.zod()` chain in either order. */
    policy<Self extends Table>(this: Self, policy: TableExecutionPolicy): Self;
  }
}
if (!Object.prototype.hasOwnProperty.call(SQLiteTable.prototype, "policy")) {
  Object.defineProperty(SQLiteTable.prototype, "policy", {
    value: function (this: object, policy: TableExecutionPolicy) {
      tablePolicies.set(this, policy);
      return this;
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

/** Read a table's declared execution policy — `{}` (not `undefined`) when none was declared, so callers can
 *  spread it unconditionally. */
export function tablePolicy(table: object): TableExecutionPolicy {
  return tablePolicies.get(table) ?? {};
}

/** A drizzle query builder as read for its target table. */
interface QueryWithTable {
  config?: { table?: Table };
}

/** The table a drizzle query builder centrally touches — SELECT's `FROM`, INSERT's `INTO`, UPDATE's target, or
 *  DELETE's `FROM`, read uniformly off `config.table` (present on all four query-builder shapes, verified against
 *  the real drizzle-orm builders). `undefined` for a query with no single target (e.g. a raw SQL fragment). */
export function queryTable(query: unknown): Table | undefined {
  return (query as QueryWithTable | undefined)?.config?.table;
}

export type QueryKind = "select" | "insert" | "update" | "delete";

/** A drizzle query builder as read for its operation-discriminating config keys (verified by direct probe against
 *  the real drizzle-orm builders: SELECT alone has `config.fields`; UPDATE alone has `config.set`; INSERT alone has
 *  `config.values`; DELETE has none of the three). */
interface QueryWithShape {
  config?: { table?: Table; fields?: unknown; set?: unknown; values?: unknown };
}

/** WHICH kind of query a drizzle builder is — a SELECT is a READ; INSERT/UPDATE/DELETE are WRITES. Used to keep
 *  {@link tablePolicy}'s write-only fields (dedupe/idempotency) from bleeding onto a plain read that happens to
 *  touch the same table a write-oriented policy was declared on. `undefined` when `queryTable` would also be
 *  `undefined` (no single target table). */
export function queryKind(query: unknown): QueryKind | undefined {
  const config = (query as QueryWithShape | undefined)?.config;
  if (!config || !("table" in config)) return undefined;
  if ("fields" in config) return "select";
  if ("set" in config) return "update";
  if ("values" in config) return "insert";
  return "delete";
}
