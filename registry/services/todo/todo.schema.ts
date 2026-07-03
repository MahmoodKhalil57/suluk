/**
 * The todo schema (Suluk registry: `todo`) — a fully-OWNED module (no `@suluk/*` logic package; the whole thing is yours).
 * One table of per-user todo items: a title + a done flag + timestamps, OWNED by `userId`. Every service query is scoped to
 * the owner, so a caller can only ever read/mutate their OWN rows. Extend it freely; `createSelectSchema(todo)` (drizzle-zod,
 * re-exported as `rowSchema` from `@suluk/effect`) bubbles this table up into the route response bodies.
 */
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const todo = sqliteTable(
  "todo",
  {
    id: text("id").primaryKey(),
    /** the OWNER — the authenticated principal (`c.get("user")`). Every query filters on it; never a client-supplied field. */
    userId: text("userId").notNull(),
    title: text("title").notNull(),
    /** done flag (SQLite has no boolean — drizzle maps it 0/1 ↔ boolean). */
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (t) => ({ byUser: index("todo_userId_idx").on(t.userId) }), // the owner filter is the hot path
);
