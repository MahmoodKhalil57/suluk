/**
 * The todo schema (Suluk registry: `todo`) — the SINGLE SOURCE for the module's data shape AND its whole wire contract.
 * One table of per-user todo items (a title + a done flag + timestamps, OWNED by `userId`), and — derived from it, in this
 * ONE file — the drizzle-zod schemas, the wire DTO, the request bodies, the per-op contract, and every TS type (via
 * `z.infer`). Nothing is rewritten downstream: the service imports the types, the routes spread the contract. Every service
 * query is owner-scoped, so a caller only ever reads/mutates their OWN rows.
 */
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { tableSchemas } from "../app";

// ── the table — each field's wire annotation lives INLINE on the column via `.zod()` (the drizzle-zod refine
//    callback, co-located with the DDL instead of in a separate object). `.zod()` returns the builder unchanged, so
//    the drizzle chain + `sqliteTable` are unaffected; `tableSchemas` reads the refiners back off the columns. ──────────
export const todo = sqliteTable(
  "todo",
  {
    id: text("id").primaryKey()
      .zod((s) => s.describe("The todo's unique id (uuid).").meta({ examples: ["a3a2747d-b05f-4db6-8ab5-50ea2c2a7b3f"] })),
    /** the OWNER — the authenticated principal (`c.get("user")`). Every query filters on it; never a client-supplied field. */
    userId: text("userId").notNull()
      .zod((s) => s.describe("The owner's user id — the authenticated principal.")),
    title: text("title").notNull()
      .zod((s) => s.describe("The todo text.").meta({ examples: ["Buy milk"] })),
    /** done flag (SQLite has no boolean — drizzle maps it 0/1 ↔ boolean). */
    completed: integer("completed", { mode: "boolean" }).notNull().default(false)
      .zod((s) => s.describe("Whether the todo is done.").meta({ examples: [false] })),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (t) => ({ byUser: index("todo_userId_idx").on(t.userId) }), // the owner filter is the hot path
);

// ── the three drizzle-zod schemas, in ONE call via the base app's `tableSchemas` — NO separate refine object now:
//    the SELECT schema's per-field DESCRIPTIONS + EXAMPLES come from the columns' co-located `.zod()` above and bubble
//    up into the doc; insert/update come straight off the columns. Add a column and all three + their types update. ──────
export const { select: todoSelect, insert: todoInsert, update: todoUpdate } = tableSchemas(todo);

// ── types INFERRED from the schemas — no hand-maintained row/insert/update type anywhere ──────────────────────────────
/** The stored row (drizzle returns `Date` for the timestamp columns). */
export type TodoRow = z.infer<typeof todoSelect>;
/** The writable columns for an insert (`completed` defaults, timestamps set by the service). */
export type TodoInsert = z.infer<typeof todoInsert>;
/** A patch — every column optional. */
export type TodoUpdate = z.infer<typeof todoUpdate>;

// ── the WIRE DTO — the SELECT schema with the timestamps projected to epoch-ms (the wire codec). The field descriptions +
//    examples come straight off `todoSelect`; the ENTITY `.describe()` becomes the response description of any route whose
//    body wraps a single todo. This is what the routes reference for the response body. ───────────────────────────────────
export const TodoItemSchema = todoSelect
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    createdAt: z.number().int().describe("When it was created — epoch milliseconds.").meta({ examples: [1783082151484] }),
    updatedAt: z.number().int().describe("When it was last updated — epoch milliseconds.").meta({ examples: [1783082151484] }),
  })
  .describe("The todo.");
/** A todo as returned to the owner — z.infer of the wire DTO (timestamps as epoch-ms). */
export type TodoItem = z.infer<typeof TodoItemSchema>;

// ── request bodies — REUSE the annotated fields off `todoSelect` (so the request doc carries the same labels/examples),
//    plus the wire validation. Create takes `title`; update is the patch (both optional). The ACTIONS (`todo.actions.ts`)
//    reference these as their `input`, and the route builder bubbles them up into the contract's `request.json`. ─────────
export const CreateReq = z.object({ title: todoSelect.shape.title.min(1).max(500) });
export const UpdateReq = z.object({
  title: todoSelect.shape.title.min(1).max(500).optional(),
  completed: todoSelect.shape.completed.optional(),
});
