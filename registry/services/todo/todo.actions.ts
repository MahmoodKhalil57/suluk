/**
 * Todo ACTIONS (Suluk registry: `todo`) — one per operation, each FUSING the wire schema (request / response envelope /
 * errors / COST as runtime values) with a single SERVICE call. This is the `routes → services → db` seam: an action's `run`
 * calls the {@link Todo} service (`Effect.flatMap(Todo, (s) => s.method(...))`) and NEVER touches the DB directly — the service
 * owns the DB. A route is then a PIPELINE or a recursive TREE of these actions (`seq`/`all`/`branch`), and `effectPipeRoute`
 * FOLDS it to bubble up the whole contract: `request.json` ← the entry leaf's `input`, the response ← the terminal's `wrap`,
 * the typed 404 ← the union of the actions' `errors`, and the route COST ← the SUM of the actions' `cost` (the monoid).
 *
 * The response ENVELOPE (`{ todo }` / `{ todos }` / `{ deleted:true }`) is built once via `envelope`/`listEnvelope`/
 * `fixedEnvelope` — schema + value together, so the doc shape and the rendered shape provably agree. Descriptions + examples
 * come straight off `TodoItemSchema` (the single schema source) and bubble into the doc unchanged.
 */
import { Effect } from "effect";
import { z } from "zod";
import { action, envelope, listEnvelope, fixedEnvelope, NotFoundError, type CostModel } from "@suluk/effect";
import { Todo } from "./todo";
import { TodoItemSchema, CreateReq, UpdateReq } from "../db/todo";

// the two entity envelopes, defined once (the single-key `{ todo }` bubbles up `TodoItemSchema`'s own `.describe("The todo.")`).
const one = envelope("todo", TodoItemSchema);
const many = listEnvelope("todos", TodoItemSchema, { describe: "The caller's todos, newest first." });

// per-action COST — each declares the infra it touches; `effectPipeRoute` SUMS these (the CostModel monoid) so a composed
// route's cost is DERIVED from what it does, not method-guessed. A read touches d1.read; a write touches d1.write (+ the
// owner-check read). Writes settle rate-limited with an overflow to credit (the C077 economics); reads settle rate-limited.
const readCost: CostModel = { components: [], infra: { "d1.read": 1 }, settlement: { method: "rate-limited" } };
const writeCost: CostModel = { components: [], infra: { "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited", overflow: "credit" } };
const deleteCost: CostModel = { components: [], infra: { "d1.write": 1 }, settlement: { method: "rate-limited", overflow: "credit" } };

/** GET — the caller's own todos, newest first. */
export const listTodos = action({
  output: TodoItemSchema.array(),
  wrap: many,
  cost: readCost,
  run: (ctx) => Effect.flatMap(Todo, (s) => s.list(ctx.userId)),
});

/** GET /:id — one todo the caller OWNS; a non-owned/absent id → the service FAILS with NotFoundError → typed 404 bubbled. */
export const getTodo = action({
  output: TodoItemSchema,
  wrap: one,
  errors: [NotFoundError],
  cost: readCost,
  run: (ctx) => Effect.flatMap(Todo, (s) => s.get(ctx.userId, ctx.param("id")!)),
});

/** (body-less) the caller's total todo count — composed ALONGSIDE `getTodo` in the `getTodoDetail` fan-out (`all`). */
export const countTodos = action({
  output: z.number().int(),
  wrap: envelope("count", z.number().int().describe("How many todos the caller has.")),
  cost: readCost,
  run: (ctx) => Effect.flatMap(Todo, (s) => s.count(ctx.userId)),
});

/** POST { title } → 201 { todo } — create a todo owned by the caller. */
export const createTodo = action({
  input: CreateReq,
  output: TodoItemSchema,
  wrap: one,
  status: 201,
  cost: writeCost,
  run: (ctx, body: { title: string }) => Effect.flatMap(Todo, (s) => s.create(ctx.userId, { title: body.title })),
});

/** PATCH /:id { title?, completed? } → { todo } — patch a todo the caller OWNS; absent/non-owned → 404. */
export const updateTodo = action({
  input: UpdateReq,
  output: TodoItemSchema,
  wrap: one,
  errors: [NotFoundError],
  cost: writeCost,
  run: (ctx, patch: { title?: string; completed?: boolean }) => Effect.flatMap(Todo, (s) => s.update(ctx.userId, ctx.param("id")!, patch)),
});

/** DELETE /:id → 200 { deleted:true } — delete a todo the caller OWNS; absent/non-owned → 404. No `status`: effectPipeRoute
 *  defaults a body-carrying wrap on a no-body method (DELETE→204) to 200, so the `{ deleted:true }` confirmation renders. */
export const deleteTodo = action({
  output: z.void(),
  wrap: fixedEnvelope<void, { deleted: true }>(z.object({ deleted: z.literal(true) }).describe("The todo was deleted."), { deleted: true }),
  errors: [NotFoundError],
  cost: deleteCost,
  run: (ctx) => Effect.flatMap(Todo, (s) => s.remove(ctx.userId, ctx.param("id")!)),
});
