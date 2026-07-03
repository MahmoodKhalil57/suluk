/**
 * Todo routes (Suluk registry: `todo`) — the module's OPERATIONS are authored as sulukts `op`s in `todo.ops.ts` (each op
 * declares its own method/path/roles/summary + contract + impl over `Db`). This file just MOUNTS them: `effectPipeRoute`
 * FOLDS each op's `meta` for the route identity, so method/path/roles are never restated here — the route supplies only the
 * `provide` (the layer wiring) and any recursive COMPOSITION.
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

// The 5 CRUD routes — method/path/roles/summary/validateBody all BUBBLE UP from each op's `meta`; the route wires only `provide`.
todos.route(effectPipeRoute({ ...base, pipeline: pipeline(T.listTodos) }));
todos.route(effectPipeRoute({ ...base, pipeline: pipeline(T.getTodo) }));
todos.route(effectPipeRoute({ ...base, pipeline: pipeline(T.createTodo) }));
todos.route(effectPipeRoute({ ...base, pipeline: pipeline(T.updateTodo) }));
todos.route(effectPipeRoute({ ...base, pipeline: pipeline(T.deleteTodo) }));

// GET /api/todos/:id/detail → { todo, count } — RECURSIVE: `all` fans getTodo + countTodos into one merged body; the contract
// bubbles up whole (errors 404 + role-implied 401, cost d1.read×2). The composite declares its own path (overriding getTodo's).
todos.route(effectPipeRoute({ ...base, method: "get", path: "/api/todos/:id/detail", name: "getTodoDetail",
  roles: ["signed-in"], summary: "Get one todo the caller owns, alongside their total todo count.",
  pipeline: all(T.getTodo, T.countTodos) }));

/** The `todo` module's CONTRACT fragment — bubbled up from the ops above (no separate `todo.contract.ts`). */
export const todoOps = todos.ops;

/** Mount every op's handler at its sub-path — DERIVED from the envelope (`.router()`). */
export function todoRoutes() {
  return todos.router();
}
