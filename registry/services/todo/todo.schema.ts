/**
 * The todo schema (Suluk registry: `todo`) — the SINGLE SOURCE for the module's data shape AND its whole wire contract.
 * Each field's wire annotation — its DESCRIPTION + EXAMPLES *and* its VALIDATION — lives INLINE on the column via `.zod()`
 * (the drizzle-zod refine callback), plus a table-level `.zod()` for the ENTITY. `tableSchemas` reads them back and overlays
 * them onto ALL THREE drizzle-zod projections (select/insert/update), so a column's `.max(500)` validates on the REQUEST
 * bodies (create/patch), not just the response — the constraint is declared ONCE, on the column, and flows everywhere.
 */
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { tableSchemas } from "../app";

// ── the table — each column carries its wire refinement inline via `.zod(s => …)`: FULL zod (constraints + `.meta({description,
//    examples})`), and a table-level `.zod()` for the entity. `s` is the column's drizzle-zod base (text → ZodString, …). ─────
export const todo = sqliteTable(
  "todo",
  {
    id: text("id").primaryKey()
      .zod((s) => s.meta({ description: "The todo's unique id (uuid).", examples: ["a3a2747d-b05f-4db6-8ab5-50ea2c2a7b3f"] })),
    /** the OWNER — the authenticated principal (`c.get("user")`). Every query filters on it; never a client-supplied field. */
    userId: text("userId").notNull()
      .zod((s) => s.meta({ description: "The owner's user id — the authenticated principal." })),
    title: text("title").notNull()
      // the VALIDATION (min/max) lives ON the column → it rides into BOTH the response DTO and the create/patch request bodies.
      .zod((s) => s.min(1).max(500).meta({ description: "The todo text.", examples: ["Buy milk"] })),
    /** done flag (SQLite has no boolean — drizzle maps it 0/1 ↔ boolean). */
    completed: integer("completed", { mode: "boolean" }).notNull().default(false)
      .zod((s) => s.meta({ description: "Whether the todo is done.", examples: [false] })),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (t) => ({ byUser: index("todo_userId_idx").on(t.userId) }), // the owner filter is the hot path
).zod((s) => s.meta({ description: "A todo item." })); // ← table-level: the ENTITY description, co-located with the DDL

// ── the three drizzle-zod schemas in ONE call — each now carries the columns' co-located `.zod()` (CONSTRAINTS + meta), and
//    `select` also carries the entity `.meta()`. Add a column and all three + their types update. ────────────────────────────
export const { select: todoSelect, insert: todoInsert, update: todoUpdate } = tableSchemas(todo);

// ── types INFERRED from the schemas — no hand-maintained row/insert/update type anywhere ──────────────────────────────────
/** The stored row (drizzle returns `Date` for the timestamp columns). */
export type TodoRow = z.infer<typeof todoSelect>;
/** The writable columns for an insert (`completed` defaults, timestamps set by the service). */
export type TodoInsert = z.infer<typeof todoInsert>;
/** A patch — every column optional. */
export type TodoUpdate = z.infer<typeof todoUpdate>;

// ── the WIRE DTO — the SELECT schema with the timestamps projected to epoch-ms (the wire codec; the DB stores `Date`). The
//    per-field descriptions/examples come off `todoSelect`; the entity `.meta()` is re-carried so it bubbles to the response. ─
export const TodoItemSchema = todoSelect
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    createdAt: z.number().int().meta({ description: "When it was created — epoch milliseconds.", examples: [1783082151484] }),
    updatedAt: z.number().int().meta({ description: "When it was last updated — epoch milliseconds.", examples: [1783082151484] }),
  })
  .meta(todoSelect.meta() ?? { description: "A todo item." });
/** A todo as returned to the owner — z.infer of the wire DTO (timestamps as epoch-ms). */
export type TodoItem = z.infer<typeof TodoItemSchema>;

// ── request bodies — REUSE the ANNOTATED `todoSelect.shape.<field>`: the title's `.min(1).max(500)` + `.meta()` (declared
//    ONCE on the column) ride into the REQUEST validation automatically, no restated constraints. Create takes `title`;
//    update is a partial patch. The ops (`todo.ops.ts`) reference these as their `input`; the route bubbles them into
//    `request.json`, and @suluk/effect's `validateBody` enforces the constraints on the wire (a bad `title` → typed 400). ───
export const CreateReq = z.object({ title: todoSelect.shape.title });
export const UpdateReq = z.object({
  title: todoSelect.shape.title.optional(),
  completed: todoSelect.shape.completed.optional(),
});
