/**
 * The todo schema (Suluk registry: `todo`) — the SINGLE SOURCE for the module's data shape AND its whole wire contract. Every
 * field's DESCRIPTION + EXAMPLES + VALIDATION lives INLINE on the column via `.zod()`; the ENTITY via the table-level `.zod()`;
 * `userId` is a FK to `user.id` (referential integrity). `tableSchemas` reads the refinements onto the drizzle-zod schemas, and
 * `wireDto` derives the response DTO AUTOMATICALLY (Date→epoch-ms, meta carried) — no per-schema `.omit()/.extend()`. Annotate a
 * column once and everything downstream (schemas, types, wire DTO, request bodies, contract) updates. Every query is owner-scoped.
 */
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { tableSchemas, wireDto } from "../app";
import { user } from "../db/auth";

// ── the table — each column carries its wire refinement inline via `.zod(s => …)` (FULL zod: constraints + `.meta({description,
//    examples})`); a table-level `.zod()` carries the ENTITY; `userId` REFERENCES `user.id` for integrity. ───────────────────
export const todo = sqliteTable(
  "todo",
  {
    id: text("id").primaryKey()
      .zod((s) => s.meta({ description: "The todo's unique id (uuid).", examples: ["a3a2747d-b05f-4db6-8ab5-50ea2c2a7b3f"] })),
    /** the OWNER — a FK to `user.id`; the authenticated principal (`c.get("user")`). Every query filters on it; never client-supplied. */
    userId: text("userId").notNull().references(() => user.id)
      .zod((s) => s.meta({ description: "The owner's user id — the authenticated principal." })),
    title: text("title").notNull()
      // VALIDATION lives ON the column (trim + length) → it rides into the response DTO AND the create/patch request bodies.
      .zod((s) => s.trim().min(1).max(500).meta({ description: "The todo text.", examples: ["Buy milk"] })),
    /** done flag (SQLite has no boolean — drizzle maps it 0/1 ↔ boolean). */
    completed: integer("completed", { mode: "boolean" }).notNull().default(false)
      .zod((s) => s.meta({ description: "Whether the todo is done.", examples: [false] })),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull()
      .zod((s) => s.meta({ description: "When it was created — epoch milliseconds.", examples: [1783082151484] })),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull()
      .zod((s) => s.meta({ description: "When it was last updated — epoch milliseconds.", examples: [1783082151484] })),
  },
  (t) => ({ byUser: index("todo_userId_idx").on(t.userId) }), // the owner filter is the hot path
).zod((s) => s.meta({ description: "A todo item." })); // ← table-level: the ENTITY description, co-located with the DDL

// ── the three drizzle-zod schemas in ONE call — each carries the columns' co-located `.zod()`; `select` also carries the entity. ─
export const { select: todoSelect, insert: todoInsert, update: todoUpdate } = tableSchemas(todo);

// ── types INFERRED from the schemas — no hand-maintained row/insert/update type anywhere ──────────────────────────────────
/** The stored row (drizzle returns `Date` for the timestamp columns). */
export type TodoRow = z.infer<typeof todoSelect>;
/** The writable columns for an insert (`completed` defaults, timestamps set by the service). */
export type TodoInsert = z.infer<typeof todoInsert>;
/** A patch — every column optional. */
export type TodoUpdate = z.infer<typeof todoUpdate>;

// ── the WIRE DTO — derived AUTOMATICALLY: `wireDto` projects the `Date` timestamp columns to epoch-ms (carrying their `.zod()`
//    meta) + preserves the entity `.meta()`. No hand-written `.omit()/.extend()`; add a timestamp column and it just works. ────
export const TodoItemSchema = wireDto(todoSelect);
/** A todo as returned to the owner — z.infer of the wire DTO (timestamps as epoch-ms). */
export type TodoItem = z.infer<typeof TodoItemSchema>;

// ── request bodies — REUSE the ANNOTATED `todoSelect.shape.<field>`: the title's `.trim().min(1).max(500)` + `.meta()` (declared
//    ONCE on the column) rides into the REQUEST validation automatically. Create takes `title`; update is a partial patch. ─────
export const CreateReq = z.object({ title: todoSelect.shape.title });
export const UpdateReq = z.object({
  title: todoSelect.shape.title.optional(),
  completed: todoSelect.shape.completed.optional(),
});
