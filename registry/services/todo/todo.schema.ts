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

// ── the table ──────────────────────────────────────────────────────────────────────────────
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

// ── the three drizzle-zod schemas, in ONE call via the base app's `tableSchemas` (no `createSelectSchema(todo)` etc. per
//    file). The SELECT schema carries the per-field DESCRIPTIONS + EXAMPLES (its `refine`) so they bubble up into the doc;
//    insert/update come straight off the columns. Add a column to `todo` and all three + their types update. ──────────────
export const { select: todoSelect, insert: todoInsert, update: todoUpdate } = tableSchemas(todo, {
  id: (s) => s.describe("The todo's unique id (uuid).").meta({ examples: ["a3a2747d-b05f-4db6-8ab5-50ea2c2a7b3f"] }),
  userId: (s) => s.describe("The owner's user id — the authenticated principal."),
  title: (s) => s.describe("The todo text.").meta({ examples: ["Buy milk"] }),
  completed: (s) => s.describe("Whether the todo is done.").meta({ examples: [false] }),
});

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
//    plus the wire validation. Create takes `title`; update is the patch (both optional). ────────────────────────────────
export const CreateReq = z.object({ title: todoSelect.shape.title.min(1).max(500) });
export const UpdateReq = z.object({
  title: todoSelect.shape.title.min(1).max(500).optional(),
  completed: todoSelect.shape.completed.optional(),
});

// ── the per-operation WIRE CONTRACT — the `request` body + the `ok` response body per op, so a route BUBBLES ONE UP by
//    spreading it (`...todoContract.read`) instead of restating a schema. Change a field on `TodoItemSchema` once and
//    every route's doc updates. The 404 is NOT listed here — the service FAILS with `NotFoundError` and it bubbles up
//    through effect.ts as a typed response (single source: the method body). ───────────────────────────────────────────
export const todoContract = {
  list: { ok: { schema: z.object({ todos: z.array(TodoItemSchema) }).describe("The caller's todos, newest first.") } },
  read: { ok: { schema: z.object({ todo: TodoItemSchema }) } },
  created: { request: { json: CreateReq }, ok: { schema: z.object({ todo: TodoItemSchema }) } },
  updated: { request: { json: UpdateReq }, ok: { schema: z.object({ todo: TodoItemSchema }) } },
  deleted: { ok: { status: 200, schema: z.object({ deleted: z.literal(true) }).describe("The todo was deleted.") } },
};
