/**
 * Todo routes (Suluk registry: `todo`) — Hono over the {@link Todo} Effect service, each route defined with `@suluk/effect`'s
 * `effectRoute` (the C075 ENVELOPE): the module's `.ops` bubble up into the contract and its `.router()` is the mount, so the
 * whole `/api/todos/*` surface is DEFINED here, with no separate `todo.contract.ts`.
 *
 * MINIMAL by design (C078): `roles: ["signed-in"]` DERIVES the mechanical fields — the `todos:<read|write>` scope, a
 * method-based cost + rate-limit, the typed 401 — AND enforces the auth guard: effectRoute returns the 401 for an anonymous
 * caller ITSELF and injects the GUARANTEED `{ userId }` as `run`'s 2nd arg, so the handler owner-scopes with `userId`
 * directly (no `c.get("user")` read, no null-check). The response DESCRIPTION + field descriptions/examples come from the
 * SERVICE's annotated `TodoItemSchema`. So a route declares only what's route-specific (its body schema + any DOMAIN 404).
 *
 * OWNER-SCOPED: that injected `userId` is the owner passed to the service, NEVER a client id, so a caller only touches THEIR
 * OWN todos (a non-owned id → typed 404). Mount: `app.route("/api/todos", todoRoutes())`.
 */
import { Effect } from "effect";
import { z } from "zod";
import { effectRoute, routeGroup, NotFoundError } from "@suluk/effect";
import { DbLive, type Bindings } from "../app";
import { Todo, TodoLive, TodoItemSchema } from "../services/todo";

// The module's ENVELOPE — `.ops` → the contract, `.router()` → the mount. Single source of the `/api/todos/*` surface.
const todos = routeGroup("/api/todos");

/** Fully-provide a Todo program against the request's DB — discharges the Effect's requirements (`R = never`) before it
 *  reaches the effectRoute handler. */
const provide = <A, E>(env: Bindings, program: Effect.Effect<A, E, Todo>): Effect.Effect<A, E, never> =>
  program.pipe(Effect.provide(TodoLive), Effect.provide(DbLive(env)));

// ── response bodies — the SERVICE owns the annotated `TodoItemSchema` (drizzle-zod + per-field describe/examples + the
// entity `.describe("The todo.")`); the routes just WRAP it. effectRoute reads the response DESCRIPTION off the wrapped
// entity, and the field descriptions + `.meta({examples})` bubble up into the doc — nothing restated per route. ──
const TodoBody = z.object({ todo: TodoItemSchema }); // wraps a single todo → its `.describe("The todo.")` bubbles up
const TodoListBody = z.object({ todos: z.array(TodoItemSchema) }).describe("The caller's todos, newest first.");
const DeletedBody = z.object({ deleted: z.literal(true) }).describe("The todo was deleted.");

// ── request bodies ──
const CreateReq = z.object({ title: z.string().min(1).max(500) });
const UpdateReq = z.object({ title: z.string().min(1).max(500).optional(), completed: z.boolean().optional() });

// ══════════════════════════════════════════════════════════════════════════════════════════
// reads — the caller's own todos. `roles:["signed-in"]` → todos:read + read cost + 120/min + the 401 guard + injected userId.
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /api/todos → { todos } — the signed-in caller's list, newest first.
todos.route(effectRoute({
  method: "get", path: "/api/todos", name: "listTodos",
  summary: "List the signed-in user's todos, newest first.",
  tags: ["Todos"], roles: ["signed-in"],
  ok: { schema: TodoListBody },
  run: (c, { userId }) => Effect.gen(function* () {
    const s = yield* Todo;
    return { todos: yield* s.list(userId) };
  }).pipe((p) => provide(c.env, p)),
}));

// GET /api/todos/:id → { todo } — one todo the caller OWNS; a non-owned/absent id → typed 404.
todos.route(effectRoute({
  method: "get", path: "/api/todos/:id", name: "getTodo",
  summary: "Get one of the signed-in user's todos by id.",
  tags: ["Todos"], roles: ["signed-in"],
  ok: { schema: TodoBody },
  errors: [NotFoundError],
  run: (c, { userId }) => Effect.gen(function* () {
    const id = c.req.param("id")!;
    const s = yield* Todo;
    const item = yield* s.get(userId, id);
    if (!item) return yield* new NotFoundError({ resource: "todo", id });
    return { todo: item };
  }).pipe((p) => provide(c.env, p)),
}));

// ══════════════════════════════════════════════════════════════════════════════════════════
// writes — create / update / delete the caller's own todos. `roles` → todos:write + write cost + 60/min + the 401 guard.
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /api/todos { title } → 201 { todo } — create a todo owned by the caller (201 is the POST default).
todos.route(effectRoute({
  method: "post", path: "/api/todos", name: "createTodo",
  summary: "Create a todo (owned by the signed-in user).",
  tags: ["Todos"], roles: ["signed-in"],
  request: { json: CreateReq },
  ok: { schema: TodoBody },
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
  tags: ["Todos"], roles: ["signed-in"],
  request: { json: UpdateReq },
  ok: { schema: TodoBody },
  errors: [NotFoundError],
  run: (c, { userId }) => Effect.gen(function* () {
    const id = c.req.param("id")!;
    const patch = yield* Effect.promise(() => c.req.json<{ title?: string; completed?: boolean }>());
    const s = yield* Todo;
    const item = yield* s.update(userId, id, patch);
    if (!item) return yield* new NotFoundError({ resource: "todo", id });
    return { todo: item };
  }).pipe((p) => provide(c.env, p)),
}));

// DELETE /api/todos/:id → 200 { deleted: true } — delete a todo the caller OWNS; absent/non-owned → 404. (ok.status:200
// overrides the DELETE default of 204 so the ack carries a body.)
todos.route(effectRoute({
  method: "delete", path: "/api/todos/:id", name: "deleteTodo",
  summary: "Delete a todo the signed-in user owns.",
  tags: ["Todos"], roles: ["signed-in"],
  ok: { status: 200, schema: DeletedBody },
  errors: [NotFoundError],
  run: (c, { userId }) => Effect.gen(function* () {
    const id = c.req.param("id")!;
    const s = yield* Todo;
    const ok = yield* s.remove(userId, id);
    if (!ok) return yield* new NotFoundError({ resource: "todo", id });
    return { deleted: true as const };
  }).pipe((p) => provide(c.env, p)),
}));

/** The `todo` module's CONTRACT fragment — bubbled up from the routes above (no separate `todo.contract.ts`). */
export const todoOps = todos.ops;

/** Mount every route's Effect handler at its sub-path — DERIVED from the envelope (`.router()`). */
export function todoRoutes() {
  return todos.router();
}
