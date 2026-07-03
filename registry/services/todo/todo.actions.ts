/**
 * Todo ACTIONS (Suluk registry: `todo`) — one per operation, each FUSING the wire schema (request / response envelope /
 * errors as runtime values) with a single SERVICE call. This is the `routes → services → db` seam: an action's `run` calls
 * the {@link Todo} service (`Effect.flatMap(Todo, (s) => s.method(...))`) and NEVER touches the DB directly — the service
 * owns the DB. A route is then a PIPELINE of these actions, and `effectPipeRoute` WALKS the pipeline to bubble up the whole
 * contract: `request.json` ← the head's `input`, the response status+body ← the terminal's `wrap`, the typed 404 ← the
 * union of the actions' `errors`. So the wire shape can't drift from the impl (same values), and there is no `todoContract`.
 *
 * The response ENVELOPE (`{ todo }` / `{ todos }` / `{ deleted:true }`) is built once via `envelope`/`listEnvelope`/
 * `fixedEnvelope` — schema + value together, so the doc shape and the rendered shape provably agree. Descriptions + examples
 * come straight off `TodoItemSchema` (the single schema source) and bubble into the doc unchanged.
 */
import { Effect } from "effect";
import { z } from "zod";
import { action, envelope, listEnvelope, fixedEnvelope, NotFoundError } from "@suluk/effect";
import { Todo } from "./todo";
import { TodoItemSchema, CreateReq, UpdateReq } from "../db/todo";

// the two entity envelopes, defined once (the single-key `{ todo }` bubbles up `TodoItemSchema`'s own `.describe("The todo.")`).
const one = envelope("todo", TodoItemSchema);
const many = listEnvelope("todos", TodoItemSchema, { describe: "The caller's todos, newest first." });

/** GET — the caller's own todos, newest first. */
export const listTodos = action({
  output: TodoItemSchema.array(),
  wrap: many,
  run: (ctx) => Effect.flatMap(Todo, (s) => s.list(ctx.userId)),
});

/** GET /:id — one todo the caller OWNS; a non-owned/absent id → the service FAILS with NotFoundError → typed 404 bubbled. */
export const getTodo = action({
  output: TodoItemSchema,
  wrap: one,
  errors: [NotFoundError],
  run: (ctx) => Effect.flatMap(Todo, (s) => s.get(ctx.userId, ctx.param("id")!)),
});

/** POST { title } → 201 { todo } — create a todo owned by the caller. */
export const createTodo = action({
  input: CreateReq,
  output: TodoItemSchema,
  wrap: one,
  status: 201,
  run: (ctx, body: { title: string }) => Effect.flatMap(Todo, (s) => s.create(ctx.userId, { title: body.title })),
});

/** PATCH /:id { title?, completed? } → { todo } — patch a todo the caller OWNS; absent/non-owned → 404. */
export const updateTodo = action({
  input: UpdateReq,
  output: TodoItemSchema,
  wrap: one,
  errors: [NotFoundError],
  run: (ctx, patch: { title?: string; completed?: boolean }) => Effect.flatMap(Todo, (s) => s.update(ctx.userId, ctx.param("id")!, patch)),
});

/** DELETE /:id → 200 { deleted:true } — delete a todo the caller OWNS; absent/non-owned → 404. No `status`: effectPipeRoute
 *  defaults a body-carrying wrap on a no-body method (DELETE→204) to 200, so the `{ deleted:true }` confirmation renders. */
export const deleteTodo = action({
  output: z.void(),
  wrap: fixedEnvelope<void, { deleted: true }>(z.object({ deleted: z.literal(true) }).describe("The todo was deleted."), { deleted: true }),
  errors: [NotFoundError],
  run: (ctx) => Effect.flatMap(Todo, (s) => s.remove(ctx.userId, ctx.param("id")!)),
});
