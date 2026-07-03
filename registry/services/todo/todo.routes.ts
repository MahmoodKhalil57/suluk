/**
 * Todo routes (Suluk registry: `todo`) — each route's `run` is a PIPELINE of service actions, and its whole v4 contract is
 * WALKED off that pipeline (no `...todoContract.<op>` spread, no per-route `Effect.gen`, no restated schema): `effectPipeRoute`
 * reads `request.json` off the head action's `input`, the response status+body off the terminal action's `wrap`, and the
 * typed errors off the union of the actions' `errors`. `roles:["signed-in"]` still derives scope/cost/rate-limit + the 401
 * guard + the injected `userId` (delegated to effectRoute unchanged).
 *
 * This is the `routes → services → db` seam made literal: a route ORCHESTRATES actions (defined in `todo.actions.ts`); each
 * action calls the {@link Todo} SERVICE; the service owns the DB. The route file declares only method/path/roles + the
 * pipeline + one module-wide `provide` (the layer wiring). Mount: `app.route("/api/todos", todoRoutes())`.
 */
import { Effect } from "effect";
import { effectPipeRoute, pipeline, routeGroup } from "@suluk/effect";
import { DbLive, type Bindings } from "../app";
import { Todo, TodoLive } from "../services/todo";
import * as A from "../services/todo.actions";

// The module's ENVELOPE — `.ops` → the contract, `.router()` → the mount. Single source of the `/api/todos/*` surface.
const todos = routeGroup("/api/todos");

/** Discharge a Todo program against the request's DB — written ONCE for the module; effectPipeRoute applies it to each
 *  pipeline after composing it, turning the actions' `R = Todo` requirement into `never` with the real per-request env. */
const provide = <X, E>(env: Bindings, p: Effect.Effect<X, E, Todo>): Effect.Effect<X, E, never> =>
  p.pipe(Effect.provide(TodoLive), Effect.provide(DbLive(env)));

// shared across every route: the tag, the audience (→ scope/cost/rate-limit/401/userId), and the layer wiring.
const base = { tags: ["Todos"], roles: ["signed-in"] as const, provide };

// GET /api/todos → { todos } — the signed-in caller's list, newest first.
todos.route(effectPipeRoute({ method: "get", path: "/api/todos", name: "listTodos",
  summary: "List the signed-in user's todos, newest first.", ...base, pipeline: pipeline(A.listTodos) }));

// GET /api/todos/:id → { todo } — one todo the caller OWNS; a non-owned/absent id → typed 404 (bubbled from the service).
todos.route(effectPipeRoute({ method: "get", path: "/api/todos/:id", name: "getTodo",
  summary: "Get one of the signed-in user's todos by id.", ...base, pipeline: pipeline(A.getTodo) }));

// POST /api/todos { title } → 201 { todo } — create a todo owned by the caller (201 from the action's status).
todos.route(effectPipeRoute({ method: "post", path: "/api/todos", name: "createTodo",
  summary: "Create a todo (owned by the signed-in user).", ...base, pipeline: pipeline(A.createTodo), validateBody: true }));

// PATCH /api/todos/:id { title?, completed? } → { todo } — patch a todo the caller OWNS; absent/non-owned → 404.
todos.route(effectPipeRoute({ method: "patch", path: "/api/todos/:id", name: "updateTodo",
  summary: "Update a todo the signed-in user owns (title and/or completed).", ...base, pipeline: pipeline(A.updateTodo), validateBody: true }));

// DELETE /api/todos/:id → 200 { deleted: true } — delete a todo the caller OWNS; absent/non-owned → 404.
todos.route(effectPipeRoute({ method: "delete", path: "/api/todos/:id", name: "deleteTodo",
  summary: "Delete a todo the signed-in user owns.", ...base, pipeline: pipeline(A.deleteTodo) }));

/** The `todo` module's CONTRACT fragment — bubbled up from the routes above (no separate `todo.contract.ts`). */
export const todoOps = todos.ops;

/** Mount every route's Effect handler at its sub-path — DERIVED from the envelope (`.router()`). */
export function todoRoutes() {
  return todos.router();
}
