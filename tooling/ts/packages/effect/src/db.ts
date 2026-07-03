/**
 * DB-as-source-of-truth — bubble a DRIZZLE table up to a Zod schema, so a module's request/response shapes are DEFINED BY
 * its database schema (the drizzle-zod bridge: https://orm.drizzle.team/docs/sqlite/zod) rather than hand-retyped next to
 * the routes. Define the table once in `src/db/<module>.ts`; derive the `effectRoute` bodies from it here — add or change a
 * column and it bubbles into the contract (and thus the v4 doc / Scalar / SDK) automatically, with nothing to keep in sync.
 *
 * @example
 *   // src/db/logs.ts — the single source
 *   export const activityLog = sqliteTable("activity_log", { id: text().primaryKey(), action: text().notNull(),
 *     createdAt: integer({ mode: "timestamp" }).notNull() });
 *
 *   // logs.routes.ts — the ROW schema bubbles up; the wire-codec deltas are spelled out (a `timestamp` column is a Date in
 *   // the DB but epoch-ms on the wire), so the response stays DERIVED from the table, not a parallel hand-written copy.
 *   const Row = rowSchema(activityLog);                                    // { id, action, createdAt: Date, ... }
 *   const LogEntry = Row.omit({ createdAt: true }).extend({ createdAt: z.number().int() });   // wire shape
 *   effectRoute({ ..., ok: { schema: z.object({ logs: z.array(LogEntry) }) } });
 *
 *   // A write op's request body is likewise the INSERT schema of its table.
 *   effectRoute({ ..., request: { json: insertSchema(activityLog).pick({ userId: true, action: true }) } });
 */
export { createSelectSchema, createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

/** The Zod schema of a table ROW as READ (a SELECT) — every column with drizzle's codecs applied (a `mode:"timestamp"`
 *  column is a `Date`, a `text` column a `string`). The Suluk-friendly alias for {@link createSelectSchema}; reach for it
 *  to derive a RESPONSE body from the DB row (spell out any wire-codec delta with `.omit`/`.extend`). */
export const rowSchema = createSelectSchema;

/** The Zod schema for an INSERT into a table — required columns required, defaulted/nullable ones optional. The
 *  Suluk-friendly alias for {@link createInsertSchema}; reach for it to derive a write op's REQUEST body from the DB row
 *  (usually `.pick(...)` the client-supplied columns). */
export const insertSchema = createInsertSchema;
