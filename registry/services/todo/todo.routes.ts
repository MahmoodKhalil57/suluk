/**
 * Todo routes (Suluk registry: `todo`) — where each op is MOUNTED. The ROUTE owns the HTTP identity — `method` + `path` +
 * `name` + `summary` — so the endpoint's address lives here, next to the mount; the op (`todo.ops.ts`) owns everything that's
 * intrinsic to the operation (roles/input/wrap/cost/errors + impl), and everything derivable is INFERRED: the response body
 * shape from the op's `wrap`, the domain type + the typed errors from the op's Effect. So a route is just its address + the
 * `provide` (layer wiring) + the pipeline.
 *
 * `getTodoDetail` is the recursive showcase: `all(getTodo, countTodos)` fans two reads into one `{ todo, count }` body — one
 * wire endpoint, one merged contract, one summed cost. Mount: `app.route("/api/todos", todoRoutes())`.
 */
import { Effect } from "effect";
import { effectPipeRoute, pipeline, all, routeGroup } from "@suluk/effect";
import { Db, DbLive, type Bindings } from "../app";
import * as T from "../services/todo";

// The module's ENVELOPE — `.ops` → the contract, `.router()` → the mount. Single source of the `/api/todos/*` surface.
const todos = routeGroup("/api/todos");

/** Discharge an op's `R = Db` requirement with the request's DB — written ONCE for the module (the ops call `Db` directly,
 *  so there is no service Layer to provide, only the DB). */
const provide = <X, E>(env: Bindings, p: Effect.Effect<X, E, Db>): Effect.Effect<X, E, never> =>
  p.pipe(Effect.provide(DbLive(env)));
const base = { provide };

// The 5 CRUD routes — the ROUTE declares the HTTP identity (method/path/name/summary); roles/cost/validateBody/errors/response
// body all BUBBLE UP from the op it mounts (`pipeline(op)`).
todos.route(effectPipeRoute({ ...base, method: "get", path: "/api/todos", name: "listTodos",
  summary: "List the signed-in user's todos, newest first.", pipeline: pipeline(T.listTodos) }));
todos.route(effectPipeRoute({ ...base, method: "get", path: "/api/todos/:id", name: "getTodo",
  summary: "Get one of the signed-in user's todos by id.", pipeline: pipeline(T.getTodo) }));
todos.route(effectPipeRoute({ ...base, method: "post", path: "/api/todos", name: "createTodo",
  summary: "Create a todo (owned by the signed-in user).", pipeline: pipeline(T.createTodo) }));
todos.route(effectPipeRoute({ ...base, method: "patch", path: "/api/todos/:id", name: "updateTodo",
  summary: "Update a todo the signed-in user owns (title and/or completed).", pipeline: pipeline(T.updateTodo) }));
todos.route(effectPipeRoute({ ...base, method: "delete", path: "/api/todos/:id", name: "deleteTodo",
  summary: "Delete a todo the signed-in user owns.", pipeline: pipeline(T.deleteTodo) }));

// GET /api/todos/:id/detail → { todo, count } — RECURSIVE: `all` fans getTodo + countTodos into one merged body; the contract
// bubbles up whole (errors 404 + role-implied 401, cost d1.read×2).
todos.route(effectPipeRoute({ ...base, method: "get", path: "/api/todos/:id/detail", name: "getTodoDetail",
  roles: ["signed-in"], summary: "Get one todo the caller owns, alongside their total todo count.",
  pipeline: all(T.getTodo, T.countTodos) }));

/** The `todo` module's CONTRACT fragment — bubbled up from the ops above (no separate `todo.contract.ts`). */
export const todoOps = todos.ops;

/** Mount every op's handler at its sub-path — DERIVED from the envelope (`.router()`). */
export function todoRoutes() {
  return todos.router();
}
