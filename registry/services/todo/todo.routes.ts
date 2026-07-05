/**
 * Todo ROUTES (Suluk registry: `todo`) — the ROUTE layer of the controller→service→model split. Each route is a `sulukFn` built
 * by `sulukFmt`-ing a CONTROLLER (its own HTTP identity — `method`/`path`/`name`/`roles` — its request `body`, its `view`, and a
 * `run` that extracts the service's input from the request) with the SERVICE it runs. Everything else BUBBLES UP the pipeline:
 * the response schema (from the model, via the service), the typed 404, the summed cost, the tightest rate-limit — the route
 * declares none of them. `sulukRoute` projects the fully-merged slice onto the host (a hono handler) + the api reference (the v4
 * contract). Mount: `app.route("/api/todos", todoRoutes())`.
 */
import { Effect } from "effect";
import type { z } from "zod";
import { routeGroup, sulukFn, sulukFmt, sulukRoute, view, listView, type AnySulukFn } from "@suluk/effect";
import { Db, DbLive, type Bindings } from "../app";
import * as S from "../services/todo";
import { ListTodosQuery } from "../services/todo";
import { CreateReq, UpdateReq } from "../models/todo";

// The module's ENVELOPE — `.ops` → the contract, `.router()` → the mount. Single source of the `/api/todos/*` surface.
const todos = routeGroup("/api/todos");

/** Discharge a route's `R = Db` requirement with the request's DB — written ONCE for the module (the models call `Db` directly,
 *  so there is no service Layer to provide, only the DB). */
const provide = <X, E>(env: Bindings, p: Effect.Effect<X, E, Db>): Effect.Effect<X, E, never> =>
  p.pipe(Effect.provide(DbLive(env)));

// ── ROUTES — `sulukFmt(controller, service)`; the controller extracts the service input from the request + owns the view. ────
// listTodos (C114): the controller forwards the RAW query record — no drizzle/table dependency at this layer (routes→
// services→models) — the model (`M.listTodos`) is what parses/compiles it into real SQL against the real table.
const listTodo = sulukFmt(
  sulukFn({ method: "get", path: "/api/todos", name: "listTodos", roles: ["signed-in"],
    summary: "List the signed-in user's todos — paginated, sorted, and filtered (SIMPLE flat params or an ADVANCED and/or/not filter tree).",
    query: ListTodosQuery, view: listView("todos", { describe: "The caller's todos, newest first by default." }),
    step: { role: "when", text: "they list their todos" },
    run: (ctx) => Effect.succeed(ctx.c.req.query()) }),
  S.listTodos,
);

const getTodo = sulukFmt(
  sulukFn({ method: "get", path: "/api/todos/:id", name: "getTodo", roles: ["signed-in"],
    summary: "Get one of the signed-in user's todos by id.", view: view("todo"),
    step: [{ role: "when", text: "they open a todo by id" }, { role: "then", text: "the todo is returned" }],
    run: (ctx) => Effect.succeed(ctx.param("id")!) }),
  S.getTodo,
);

const createTodo = sulukFmt(
  // the request body + its validation BUBBLE UP from the model's `input` (insertTodo) — the route restates nothing.
  sulukFn({ method: "post", path: "/api/todos", name: "createTodo", roles: ["signed-in"],
    summary: "Create a todo (owned by the signed-in user).", ok: { status: 201 }, view: view("todo"),
    step: { role: "when", text: "they create a todo" },
    run: (ctx, body: z.infer<typeof CreateReq>) => Effect.succeed(body) }),
  S.createTodo,
);

const updateTodo = sulukFmt(
  sulukFn({ method: "patch", path: "/api/todos/:id", name: "updateTodo", roles: ["signed-in"],
    summary: "Update a todo the signed-in user owns (title and/or completed).", body: UpdateReq, validateBody: true, view: view("todo"),
    step: { role: "when", text: "they edit a todo" },
    run: (ctx, patch: { title?: string; completed?: boolean }) => Effect.succeed({ id: ctx.param("id")!, patch }) }),
  S.updateTodo,
);

const deleteTodo = sulukFmt(
  sulukFn({ method: "delete", path: "/api/todos/:id", name: "deleteTodo", roles: ["signed-in"],
    summary: "Delete a todo the signed-in user owns.",
    step: { role: "when", text: "they delete a todo" },
    run: (ctx) => Effect.succeed(ctx.param("id")!) }),
  S.deleteTodo,
);

// getTodoDetail → { todo, count } — the FAN-OUT: `sulukFmt.all` runs the getTodo + countTodos services on the same input and
// DERIVES the merged `{ todo, count }` body (its schema) + UNIONs their errors (getTodo's 404) + SUMs their cost. The controller
// extracts the id; nothing is restated — not the composite schema, not the 404, not the cost.
const getTodoDetail = sulukFmt(
  sulukFn({ method: "get", path: "/api/todos/:id/detail", name: "getTodoDetail", roles: ["signed-in"],
    summary: "Get one todo the caller owns, alongside their total todo count.",
    step: { role: "when", text: "they open a todo with their total count" },
    run: (ctx) => Effect.succeed(ctx.param("id")!) }),
  sulukFmt.all({ todo: S.getTodo, count: S.countTodos }),
);

// MOUNT every route — `sulukRoute` derives the contract + the hono handler from the merged slice.
const routes: AnySulukFn[] = [listTodo, getTodo, createTodo, updateTodo, deleteTodo, getTodoDetail];
for (const r of routes) todos.route(sulukRoute(r, { provide }));

/** The `todo` module's CONTRACT fragment — bubbled up from the routes above (no separate `todo.contract.ts`). */
export const todoOps = todos.ops;

/** Mount every route's handler at its sub-path — DERIVED from the envelope (`.router()`). */
export function todoRoutes() {
  return todos.router();
}
