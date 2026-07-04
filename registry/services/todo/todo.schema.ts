/**
 * The todo TABLE (Suluk registry: `todo`) — the ONE master, and NOTHING else: just the drizzle table, every column carrying
 * its wire refinement inline via `.zod(s => …)` plus a table-level `.zod()` for the entity. Everything DERIVABLE from it — the
 * row/DTO types, the wire DTO, the sliced request bodies — lives next to the OPERATIONS in `services/todo.ts`, inferred from
 * `todo.zodSchema` (the annotated SELECT projection). Add/annotate a column here and every derived artifact over there updates.
 * `userId` is a FK to `user.id` (referential integrity); every query is owner-scoped.
 */
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { nanoid, msRange } from "../app";
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

// Everything else — `TodoRow` / `TodoItemSchema` / `TodoItem` / `CreateReq` / `UpdateReq` — is DERIVED from `todo.zodSchema`
// next to the operations that use it, in `services/todo.ts`. Nothing but the table lives here.
