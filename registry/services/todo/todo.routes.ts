/**
 * Todo routes (Suluk registry: `todo`) — Hono over the {@link Todo} Effect service, each route defined with `@suluk/effect`'s
 * `effectRoute` (the C075 ENVELOPE): the module's `.ops` bubble up into the contract and its `.router()` is the mount, so the
 * whole `/api/todos/*` surface is DEFINED here, with no separate `todo.contract.ts`.
 *
 * MINIMAL by design (C078): the SERVICE owns the whole wire contract, and each route BUBBLES IT UP:
 *   • `roles: ["signed-in"]` DERIVES the scope + cost + rate-limit + the typed 401, and INJECTS the auth guard (effectRoute
 *     401s an anonymous caller itself + hands `run` a GUARANTEED `{ userId }` — no `caller(c)`, no null-check).
 *   • `...todoContract.<op>` spreads the response body + typed errors DEFINED IN THE SERVICE (`todo.service.ts`) — the doc's
 *     typed 200 body + descriptions + examples + the 404, without a single schema restated on the route.
 *   • the SERVICE OWNS not-found: `get`/`update`/`remove` FAIL with `NotFoundError`, which BUBBLES UP to a typed 404 through
 *     effect.ts — so the handlers are one-liners with no `if (!item)` check.
 * OWNER-SCOPED: the injected `userId` is the owner passed to the service (never a client id) — a caller only touches THEIR
 * OWN todos. Mount: `app.route("/api/todos", todoRoutes())`.
 */
import { Effect } from "effect";
import { effectRoute, routeGroup } from "@suluk/effect";
import { DbLive, type Bindings } from "../app";
import { Todo, TodoLive, todoContract } from "../services/todo";

// The module's ENVELOPE — `.ops` → the contract, `.router()` → the mount. Single source of the `/api/todos/*` surface.
const todos = routeGroup("/api/todos");

/** Fully-provide a Todo program against the request's DB — discharges the Effect's requirements (`R = never`) before it
 *  reaches the effectRoute handler. */
const provide = <A, E>(env: Bindings, program: Effect.Effect<A, E, Todo>): Effect.Effect<A, E, never> =>
  program.pipe(Effect.provide(TodoLive), Effect.provide(DbLive(env)));

// ══════════════════════════════════════════════════════════════════════════════════════════
// reads — the caller's own todos. `roles` → todos:read + read cost + 120/min + the 401 guard + injected userId.
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /api/todos → { todos } — the signed-in caller's list, newest first.
todos.route(effectRoute({
  method: "get", path: "/api/todos", name: "listTodos",
  summary: "List the signed-in user's todos, newest first.",
  tags: ["Todos"], roles: ["signed-in"], ...todoContract.list,
  run: (c, { userId }) => Effect.gen(function* () {
    const s = yield* Todo;
    return { todos: yield* s.list(userId) };
  }).pipe((p) => provide(c.env, p)),
}));

// GET /api/todos/:id → { todo } — one todo the caller OWNS; a non-owned/absent id → typed 404 (bubbled from the service).
todos.route(effectRoute({
  method: "get", path: "/api/todos/:id", name: "getTodo",
  summary: "Get one of the signed-in user's todos by id.",
  tags: ["Todos"], roles: ["signed-in"], ...todoContract.read,
  run: (c, { userId }) => Effect.gen(function* () {
    const s = yield* Todo;
    return { todo: yield* s.get(userId, c.req.param("id")!) };
  }).pipe((p) => provide(c.env, p)),
}));

// ══════════════════════════════════════════════════════════════════════════════════════════
// writes — create / update / delete the caller's own todos. `roles` → todos:write + write cost + 60/min + the 401 guard.
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /api/todos { title } → 201 { todo } — create a todo owned by the caller (201 is the POST default).
todos.route(effectRoute({
  method: "post", path: "/api/todos", name: "createTodo",
  summary: "Create a todo (owned by the signed-in user).",
  tags: ["Todos"], roles: ["signed-in"], ...todoContract.created,
  run: (c, { userId }) => Effect.gen(function* () {
    const { title } = yield* Effect.promise(() => c.req.json<{ title: string }>());
    const s = yield* Todo;
    return { todo: yield* s.create(userId, { title }) };
  }).pipe((p) => provide(c.env, p)),
}));

// PATCH /api/todos/:id { title?, completed? } → 200 { todo } — patch a todo the caller OWNS; absent/non-owned → 404.
todos.route(effectRoute({
  method: "patch", path: "/api/todos/:id", name: "updateTodo",
  summary: "Update a todo the signed-in user owns (title and/or completed).",
  tags: ["Todos"], roles: ["signed-in"], ...todoContract.updated,
  run: (c, { userId }) => Effect.gen(function* () {
    const patch = yield* Effect.promise(() => c.req.json<{ title?: string; completed?: boolean }>());
    const s = yield* Todo;
    return { todo: yield* s.update(userId, c.req.param("id")!, patch) };
  }).pipe((p) => provide(c.env, p)),
}));

// DELETE /api/todos/:id → 200 { deleted: true } — delete a todo the caller OWNS; absent/non-owned → 404.
todos.route(effectRoute({
  method: "delete", path: "/api/todos/:id", name: "deleteTodo",
  summary: "Delete a todo the signed-in user owns.",
  tags: ["Todos"], roles: ["signed-in"], ...todoContract.deleted,
  run: (c, { userId }) => Effect.gen(function* () {
    const s = yield* Todo;
    yield* s.remove(userId, c.req.param("id")!);
    return { deleted: true as const };
  }).pipe((p) => provide(c.env, p)),
}));

/** The `todo` module's CONTRACT fragment — bubbled up from the routes above (no separate `todo.contract.ts`). */
export const todoOps = todos.ops;

/** Mount every route's Effect handler at its sub-path — DERIVED from the envelope (`.router()`). */
export function todoRoutes() {
  return todos.router();
}
