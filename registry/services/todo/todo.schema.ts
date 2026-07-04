/**
 * The todo schema (Suluk registry: `todo`) — ONE table is the master, and EVERYTHING infers from `todo.zodSchema`: a static,
 * precisely-typed zod object read straight off the table (the annotated SELECT projection — every column's co-located `.zod()`
 * refinement + the table-level `.zod()` entity). Slice operations off it (`todo.zodSchema.pick({title:true})`), infer types
 * (`z.infer<typeof todo.zodSchema>`), derive the wire DTO (`wireDto`). Add/annotate a column and everything downstream updates.
 * `userId` is a FK to `user.id` (referential integrity); every query is owner-scoped.
 */
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { wireDto, nanoid, msRange } from "../app";
import { user } from "../db/auth";

// ── the table — each column carries its wire refinement inline via `.zod(s => …)` (FULL zod: constraints + `.meta()`); a
//    table-level `.zod()` carries the ENTITY; `userId` REFERENCES `user.id` for integrity. This is the SINGLE source. ─────────
export const todo = sqliteTable(
  "todo",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid())
      .zod((s) => s.nanoid().meta({ description: "The todo's unique id (nanoid).", examples: ["V1StGXR8_Z5jdHi6B-myT"] })),
    /** the OWNER — a FK to `user.id`; the authenticated principal (`c.get("user")`). Every query filters on it; never client-supplied. */
    userId: text("userId").notNull().references(() => user.id)
      .zod((s) => s.meta({ description: "The owner's user id — the authenticated principal." })),
    title: text("title").notNull()
      // VALIDATION lives ON the column — trim + length + a Unicode content rule (letters/numbers/punctuation/spaces, so "Buy
      // milk" passes) — and rides into the response DTO AND the create/patch request bodies.
      .zod((s) =>
        s
          .trim()
          .min(1)
          .max(500)
          .regex(/^[\p{L}\p{N}\p{P}\p{Zs}]+$/u, "Title must contain only letters, numbers, punctuation, and spaces.")
          .meta({ description: "The todo text.", examples: ["Buy milk"] }),
      ),
    /** done flag (SQLite has no boolean — drizzle maps it 0/1 ↔ boolean). */
    completed: integer("completed", { mode: "boolean" }).notNull().default(false)
      .zod((s) => s.meta({ description: "Whether the todo is done.", examples: [false] })),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull()
      // min/max on a Date column (kept as `mode:"timestamp"`, not an integer) via `msRange` — the bounds ride into the DB Date
      // schema AND onto the wire epoch-ms number. Sane window: on/after the epoch, on/before the year 2100.
      .zod((s) => msRange(s, { min: 0, max: new Date("2100-01-01").getTime() }).meta({ description: "When it was created — epoch milliseconds.", examples: [1783082151484] })),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull()
      .zod((s) => msRange(s, { min: 0, max: new Date("2100-01-01").getTime() }).meta({ description: "When it was last updated — epoch milliseconds.", examples: [1783082151484] })),
  },
  (t) => ({ byUser: index("todo_userId_idx").on(t.userId) }), // the owner filter is the hot path
).zod((s) => s.meta({ description: "A todo item." })); // ← table-level: the ENTITY description, co-located with the DDL

// ── EVERYTHING below infers from the master `todo.zodSchema` — no `tableSchemas(...)`, no restated shapes. ───────────────────
/** The stored row (drizzle returns `Date` for the timestamp columns) — inferred from the master. */
export type TodoRow = z.infer<typeof todo.zodSchema>;

// ── the WIRE DTO — derived AUTOMATICALLY: `wireDto` projects the master's `Date` timestamp columns to epoch-ms (carrying their
//    `.zod()` meta) + preserves the entity `.meta()`. No hand-written `.omit()/.extend()`. ─────────────────────────────────────
export const TodoItemSchema = wireDto(todo.zodSchema);
/** A todo as returned to the owner — z.infer of the wire DTO (timestamps as epoch-ms). */
export type TodoItem = z.infer<typeof TodoItemSchema>;

// ── request bodies — SLICED off the master so a column's `.trim().min(1).max(500).regex(…)` validates on the wire. Create takes
//    `title`; update is a partial patch of `{ title?, completed? }`. The ops reference these as their `input`. ─────────────────
export const CreateReq = todo.zodSchema.pick({ title: true });
export const UpdateReq = todo.zodSchema.pick({ title: true, completed: true }).partial();
