/**
 * The activity-log schema (Suluk registry: `logs`) — a fully-OWNED module (no `@suluk/*` logic package; the whole thing is
 * yours). One append-only table: who did what, when, with an optional JSON detail. Extend it freely.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  userId: text("userId"),
  action: text("action").notNull(),
  /** JSON-encoded detail (or null). */
  detail: text("detail"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
