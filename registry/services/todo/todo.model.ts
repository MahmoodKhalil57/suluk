/**
 * The todo MODEL (Suluk registry: `todo`) — the MODEL layer of the controller→service→model split, and the bridge from the
 * STATE SOURCE (the drizzle `todo` table) into the v4 contract. It owns everything DERIVED from the table's master
 * `todo.zodSchema`: the row/DTO types, the wire DTO (`Date` timestamps → epoch-ms), the row→wire mapper, and the request
 * bodies. `TodoModel = model(TodoItemSchema)` makes that wire schema the RESPONSE schema a service returns and a controller's
 * `view` wraps — so the database schema (its per-field constraints, `$ref` provenance, descriptions) bubbles straight into the
 * api reference. Add/annotate a column in `db/todo.ts` and every artifact here — and the contract — updates.
 */
import { z } from "zod";
import { model, type SulukModel } from "@suluk/effect";
import { wireDto } from "../app";
import { todo } from "../db/todo";

/** The stored row (drizzle returns `Date` for the timestamp columns) — inferred from the master. */
export type TodoRow = z.infer<typeof todo.zodSchema>;
/** The wire DTO — `wireDto` projects the master's `Date` timestamp columns to epoch-ms (carrying each column's `.zod()` meta). */
export const TodoItemSchema = wireDto(todo.zodSchema);
/** A todo as returned to the owner — `z.infer` of the wire DTO (timestamps as epoch-ms). */
export type TodoItem = z.infer<typeof TodoItemSchema>;

/** request bodies — SLICED off the master so a column's `.trim().min(1).max(500).regex(…)` validates on the wire. Create takes
 *  `title`; update is a partial patch of `{ title?, completed? }`. A controller declares one as its `body`. */
export const CreateReq = todo.zodSchema.pick({ title: true });
export const UpdateReq = todo.zodSchema.pick({ title: true, completed: true }).partial();

/** map a stored row (Date timestamps) → the wire DTO (epoch-ms) — the model's domain projection. */
export const toItem = (r: TodoRow): TodoItem => ({
  id: r.id,
  userId: r.userId,
  title: r.title,
  completed: r.completed,
  createdAt: r.createdAt.getTime(),
  updatedAt: r.updatedAt.getTime(),
});

/** The TODO MODEL — bridges the table's wire schema into the contract as the entity's response schema. A service returns
 *  `TodoItem`s (mapped via {@link toItem}); a controller wraps them with `view("todo")` / `listView("todos")`. */
export const TodoModel: SulukModel<TodoItem> = model(TodoItemSchema);
