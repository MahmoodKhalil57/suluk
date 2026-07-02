/**
 * The Logs service (Suluk registry: `logs`) — a fully-owned Effect-TS activity log over the `activity_log` table. Record
 * an action; read a principal's recent activity. Depends on the `Db` service from `app`.
 */
import { Context, Effect, Layer } from "effect";
import { and, desc, eq, gte, sql, type SQL } from "drizzle-orm";
import { activityLog } from "../db/logs";
import { Db } from "../app";

export interface LogEntry {
  id: string;
  userId: string | null;
  action: string;
  detail: unknown;
  createdAt: number;
}

/**
 * A small, SAFE filter over the activity log (the Activity/query surface). A CLOSED whitelist of fields — `userId`
 * (exact), `action` (exact, or `~substring` via a leading `~`), `since` (createdAt >= a ms epoch) — every value compiled
 * to a BOUND drizzle parameter (the `${value}` helpers), so user text NEVER reaches SQL as text. Mirrors the oracle
 * (`logquery.ts`) discipline; adapted to `activity_log`'s columns. Same shape the query route composes from ?params.
 */
export interface LogQuery {
  userId?: string;
  /** exact match, unless prefixed with `~` → a case-sensitive substring match on the action string. */
  action?: string;
  /** lower bound on `createdAt`, as a ms-since-epoch number (inclusive). */
  since?: number;
  limit?: number;
}

/** One bucket of a coarse action-count timeseries (count of matching rows per distinct `action`). */
export interface LogBucket {
  action: string;
  count: number;
}

// Escape SQL-LIKE metacharacters so a user's % or _ matches literally (the value is already a bound param; this is
// correctness, not safety). Paired with `ESCAPE '\'` in the compiled LIKE. (From the oracle.)
const escapeLike = (s: string): string => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Compile a {@link LogQuery} to PARAMETERIZED drizzle conditions over `activity_log`. Every value is a bound parameter
 * and fields come only from the closed set above — there is no path for user text to become SQL. `[]` ⇒ match all.
 */
function compileQuery(q: LogQuery): SQL[] {
  const conds: SQL[] = [];
  if (q.userId) conds.push(eq(activityLog.userId, q.userId));
  if (q.action) {
    // a leading `~` switches exact → substring (the oracle's `~contains`); value stays a BOUND param either way.
    if (q.action.startsWith("~")) {
      const needle = q.action.slice(1);
      // the oracle's exact bound-param LIKE idiom (logquery.ts): the pattern is a bound param, never interpolated text.
      conds.push(sql`${activityLog.action} LIKE ${"%" + escapeLike(needle) + "%"} ESCAPE '\\'`);
    } else {
      conds.push(eq(activityLog.action, q.action));
    }
  }
  if (q.since != null && Number.isFinite(q.since)) conds.push(gte(activityLog.createdAt, new Date(q.since)));
  return conds;
}

export class Logs extends Context.Tag("Logs")<
  Logs,
  {
    readonly record: (e: { userId?: string | null; action: string; detail?: unknown }) => Effect.Effect<void>;
    readonly recent: (opts?: { userId?: string; limit?: number }) => Effect.Effect<LogEntry[]>;
    /** filter the activity log by the closed {@link LogQuery} whitelist (all bound params). Newest first. */
    readonly query: (q?: LogQuery) => Effect.Effect<LogEntry[]>;
    /** a coarse count-per-action timeseries over the same filtered slice (the Activity tab's histogram). */
    readonly timeseries: (q?: LogQuery) => Effect.Effect<LogBucket[]>;
  }
>() {}

export const LogsLive = Layer.effect(
  Logs,
  Effect.gen(function* () {
    const db = yield* Db;
    return {
      record: (e) =>
        Effect.promise(async () => {
          await db.insert(activityLog).values({
            id: crypto.randomUUID(),
            userId: e.userId ?? null,
            action: e.action,
            detail: e.detail != null ? JSON.stringify(e.detail) : null,
            createdAt: new Date(),
          });
        }),
      recent: (opts = {}) =>
        Effect.promise(async () => {
          const q = db.select().from(activityLog);
          const rows = await (opts.userId ? q.where(eq(activityLog.userId, opts.userId)) : q)
            .orderBy(desc(activityLog.createdAt))
            .limit(opts.limit ?? 100);
          return rows.map((r) => ({ id: r.id, userId: r.userId, action: r.action, detail: r.detail ? JSON.parse(r.detail) : null, createdAt: r.createdAt.getTime() }));
        }),

      query: (q = {}) =>
        Effect.promise(async () => {
          const conds = compileQuery(q);
          const rows = await db
            .select()
            .from(activityLog)
            .where(conds.length ? and(...conds) : undefined)
            .orderBy(desc(activityLog.createdAt))
            .limit(q.limit ?? 100);
          return rows.map((r) => ({ id: r.id, userId: r.userId, action: r.action, detail: r.detail ? JSON.parse(r.detail) : null, createdAt: r.createdAt.getTime() }));
        }),

      timeseries: (q = {}) =>
        Effect.promise(async () => {
          const conds = compileQuery(q);
          const rows = await db
            .select({ action: activityLog.action, count: sql<number>`count(*)`.as("count") })
            .from(activityLog)
            .where(conds.length ? and(...conds) : undefined)
            .groupBy(activityLog.action)
            .orderBy(desc(sql`count(*)`));
          return rows.map((r) => ({ action: r.action, count: Number(r.count) }));
        }),
    };
  }),
);
