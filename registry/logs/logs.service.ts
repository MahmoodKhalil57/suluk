/**
 * The Logs service (Suluk registry: `logs`) — a fully-owned Effect-TS activity log over the `activity_log` table. Record
 * an action; read a principal's recent activity. Depends on the `Db` service from `app`.
 */
import { Context, Effect, Layer } from "effect";
import { desc, eq } from "drizzle-orm";
import { activityLog } from "../db/logs";
import { Db } from "../app";

export interface LogEntry {
  id: string;
  userId: string | null;
  action: string;
  detail: unknown;
  createdAt: number;
}

export class Logs extends Context.Tag("Logs")<
  Logs,
  {
    readonly record: (e: { userId?: string | null; action: string; detail?: unknown }) => Effect.Effect<void>;
    readonly recent: (opts?: { userId?: string; limit?: number }) => Effect.Effect<LogEntry[]>;
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
    };
  }),
);
