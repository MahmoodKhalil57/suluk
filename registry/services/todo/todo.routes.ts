/**
 * Todo CONTROLLERS + VIEWS (Suluk registry: `todo`) — the top of the controller→service→model split, where each endpoint is
 * ASSEMBLED and MOUNTED. A controller `sulukFn` owns the HTTP identity (`method`/`path`/`roles`/`summary`), the request `body`
 * (for writes), and the `view` (the response envelope — `view("todo")` / `listView("todos")`), and its `run` translates the
 * HTTP request into a call to the SERVICE (extracting path params, threading the parsed body). Everything else BUBBLES UP: the
 * response schema from the model (via the service), the typed 404 from the by-id service, the summed cost, the tightest
 * rate-limit — so the controller declares only what's genuinely its own. `sulukRoute` projects the fully-merged slice onto the
 * host (the hono handler) + the api reference (the v4 contract). Mount: `app.route("/api/todos", todoRoutes())`.
 */
import { Effect } from "effect";
import { z } from "zod";
import { routeGroup, sulukFn, sulukRoute, view, listView, type AnySulukFn } from "@suluk/effect";
import { Db, DbLive, type Bindings } from "../app";
import * as S from "../services/todo";
import { TodoItemSchema, CreateReq, UpdateReq } from "../models/todo";

// The module's ENVELOPE — `.ops` → the contract, `.router()` → the mount. Single source of the `/api/todos/*` surface.
const todos = routeGroup("/api/todos");

/** Discharge a controller's `R = Db` requirement with the request's DB — written ONCE for the module (the services call `Db`
 *  directly, so there is no service Layer to provide, only the DB). */
const provide = <X, E>(env: Bindings, p: Effect.Effect<X, E, Db>): Effect.Effect<X, E, never> =>
  p.pipe(Effect.provide(DbLive(env)));

// ── CONTROLLERS — one per route; each wraps a service and declares the endpoint's own HTTP surface. ────────────────────────
const listTodosCtrl = sulukFn({
  deps: { svc: S.listTodos }, method: "get", path: "/api/todos", name: "listTodos", roles: ["signed-in"],
  summary: "List the signed-in user's todos, newest first.", view: listView("todos", { describe: "The caller's todos, newest first." }),
  run: (ctx, _in, { svc }) => svc.run(ctx, undefined),
});

const getTodoCtrl = sulukFn({
  deps: { svc: S.getTodo }, method: "get", path: "/api/todos/:id", name: "getTodo", roles: ["signed-in"],
  summary: "Get one of the signed-in user's todos by id.", view: view("todo"),
  run: (ctx, _in, { svc }) => svc.run(ctx, ctx.param("id")!),
});

const createTodoCtrl = sulukFn({
  deps: { svc: S.createTodo }, method: "post", path: "/api/todos", name: "createTodo", roles: ["signed-in"],
  summary: "Create a todo (owned by the signed-in user).", body: CreateReq, validateBody: true, ok: { status: 201 }, view: view("todo"),
  run: (ctx, body: { title: string }, { svc }) => svc.run(ctx, body),
});

const updateTodoCtrl = sulukFn({
  deps: { svc: S.updateTodo }, method: "patch", path: "/api/todos/:id", name: "updateTodo", roles: ["signed-in"],
  summary: "Update a todo the signed-in user owns (title and/or completed).", body: UpdateReq, validateBody: true, view: view("todo"),
  run: (ctx, patch: { title?: string; completed?: boolean }, { svc }) => svc.run(ctx, { id: ctx.param("id")!, patch }),
});

const deleteTodoCtrl = sulukFn({
  deps: { svc: S.deleteTodo }, method: "delete", path: "/api/todos/:id", name: "deleteTodo", roles: ["signed-in"],
  summary: "Delete a todo the signed-in user owns.", ok: { schema: z.object({ deleted: z.literal(true) }).describe("The todo was deleted.") },
  run: (ctx, _in, { svc }) => Effect.map(svc.run(ctx, ctx.param("id")!), () => ({ deleted: true as const })),
});

// getTodoDetail → { todo, count } — the CONTROLLER composes TWO services and declares the composite `ok`. The 404 (from
// getTodo) + cost (getTodo + countTodos, summed) bubble up; only the merged wire shape is stated here.
const getTodoDetailCtrl = sulukFn({
  deps: { get: S.getTodo, count: S.countTodos }, method: "get", path: "/api/todos/:id/detail", name: "getTodoDetail", roles: ["signed-in"],
  summary: "Get one todo the caller owns, alongside their total todo count.",
  ok: { schema: z.object({ todo: TodoItemSchema, count: z.number().int() }).describe("A todo the caller owns and their total count.") },
  run: (ctx, _in, { get, count }) => Effect.gen(function* () {
    const t = yield* get.run(ctx, ctx.param("id")!);
    const c = yield* count.run(ctx, undefined);
    return { todo: t, count: c };
  }),
});

// MOUNT every controller — `sulukRoute` derives the contract + the hono handler from the merged slice.
const controllers: AnySulukFn[] = [listTodosCtrl, getTodoCtrl, createTodoCtrl, updateTodoCtrl, deleteTodoCtrl, getTodoDetailCtrl];
for (const ctrl of controllers) todos.route(sulukRoute(ctrl, { provide }));

/** The `todo` module's CONTRACT fragment — bubbled up from the controllers above (no separate `todo.contract.ts`). */
export const todoOps = todos.ops;

/** Mount every controller's handler at its sub-path — DERIVED from the envelope (`.router()`). */
export function todoRoutes() {
  return todos.router();
}
