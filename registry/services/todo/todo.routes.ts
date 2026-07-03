/**
 * Todo routes (Suluk registry: `todo`) — Hono over the {@link Todo} Effect service, each route defined with `@suluk/effect`'s
 * `effectRoute` (the C075 ENVELOPE): the module's `.ops` bubble up into the contract and its `.router()` is the mount, so the
 * whole `/api/todos/*` surface is DEFINED here, with no separate `todo.contract.ts`.
 *
 * ONLY SIGNED-IN USERS: every route reads the AUTHENTICATED principal off `c.get("user")` (set by the auth `identity`
 * middleware) and returns a typed 401 `UnauthorizedError` when there is none — an anonymous caller can never reach the data.
 * OWNER-SCOPED: that principal is the owner passed to the service, NEVER a client-supplied id, so a caller only ever
 * touches THEIR OWN todos (a non-owned id is a typed 404, indistinguishable from absent).
 *
 * METERED + RATE-LIMITED: every route declares its cost (`x-suluk-cost`) + rate budget (`x-suluk-ratelimit`) inline, so
 * @suluk/cost meters + attributes the usage (per-user µ$) and @suluk/scalar renders it. Both reads and writes SETTLE
 * `rate-limited` — a free tier, capped by the per-route window + the rate-credit µ$ bucket; writes additionally declare
 * `overflow:"credit"` (usage beyond the free tier is paid by credits). That overflow is ADVISORY: the cost is metered here,
 * but no inline debit is wired (the platform charges centrally — the same posture as every other write in the registry;
 * only the credits module itself debits the ledger). Mount: `app.route("/api/todos", todoRoutes())`.
 */
import { Effect } from "effect";
import { z } from "zod";
import { effectRoute, routeGroup, rowSchema, UnauthorizedError, NotFoundError } from "@suluk/effect";
import { DbLive, type Bindings } from "../app";
import { Todo, TodoLive } from "../services/todo";
import { todo } from "../db/todo";

// The module's ENVELOPE — `.ops` → the contract, `.router()` → the mount. Single source of the `/api/todos/*` surface.
const todos = routeGroup("/api/todos");

/** The AUTHENTICATED caller's id — the principal the auth `identity` middleware stashed as `c.get("user")`. Read off the
 *  variables bag (not declared as AppVars in this decoupled module, so cast the read). NEVER a client-supplied field. */
const caller = (c: { var: { user?: { id?: string } } }): string | null => c.var.user?.id ?? null;

/** Fully-provide a Todo program against the request's DB — discharges the Effect's requirements (`R = never`) before it
 *  reaches the effectRoute handler. */
const provide = <A, E>(env: Bindings, program: Effect.Effect<A, E, Todo>): Effect.Effect<A, E, never> =>
  program.pipe(Effect.provide(TodoLive), Effect.provide(DbLive(env)));

// ── response bodies, DERIVED FROM THE DB ROW (drizzle-zod via @suluk/effect) — add a column and it bubbles up here ──
// the wire-codec deltas: `createdAt`/`updatedAt` are `Date` in the DB (mode:"timestamp") but epoch-ms on the wire.
const TodoItemSchema = rowSchema(todo)
  .omit({ createdAt: true, updatedAt: true })
  .extend({ createdAt: z.number().int(), updatedAt: z.number().int() });
const TodoListBody = z.object({ todos: z.array(TodoItemSchema) });
const TodoBody = z.object({ todo: TodoItemSchema });
const DeletedBody = z.object({ deleted: z.literal(true) });

// ── request bodies ──
const CreateReq = z.object({ title: z.string().min(1).max(500) });
const UpdateReq = z.object({ title: z.string().min(1).max(500).optional(), completed: z.boolean().optional() });

// ── cost blocks: both settle `rate-limited` (a free tier); writes declare `overflow:"credit"` (pay-per-use beyond it). ──
// Kept consistent with every other write in the registry — the method is `rate-limited`, so no 402 is implied/declared;
// the overflow charge is advisory (metered by @suluk/cost, not inline-debited).
const COST_READ = { components: [], infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "rate-limited" as const, overflow: "deny" as const } };
const COST_WRITE = { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" as const, overflow: "credit" as const } };

// ══════════════════════════════════════════════════════════════════════════════════════════
// reads — the caller's own todos (rate-limited free tier). 401 when not signed in; 404 for a non-owned/absent id.
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /api/todos → { todos } — the signed-in caller's list, newest first.
todos.route(effectRoute({
  method: "get", path: "/api/todos", name: "listTodos",
  summary: "List the signed-in user's todos, newest first.",
  tags: ["Todos"], scopes: ["todo:read"], cost: COST_READ,
  rateLimit: { windowMs: 60_000, maxRequests: 120, key: "principal" },
  ok: { status: 200, schema: TodoListBody, description: "The caller's todos." },
  errors: [UnauthorizedError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const s = yield* Todo;
    return { todos: yield* s.list(userId) };
  }).pipe((p) => provide(c.env, p)),
}));

// GET /api/todos/:id → { todo } — one todo the caller OWNS; a non-owned/absent id → typed 404.
todos.route(effectRoute({
  method: "get", path: "/api/todos/:id", name: "getTodo",
  summary: "Get one of the signed-in user's todos by id.",
  tags: ["Todos"], scopes: ["todo:read"], cost: COST_READ,
  rateLimit: { windowMs: 60_000, maxRequests: 120, key: "principal" },
  ok: { status: 200, schema: TodoBody, description: "The todo." },
  errors: [UnauthorizedError, NotFoundError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const id = c.req.param("id")!;
    const s = yield* Todo;
    const item = yield* s.get(userId, id);
    if (!item) return yield* new NotFoundError({ resource: "todo", id });
    return { todo: item };
  }).pipe((p) => provide(c.env, p)),
}));

// ══════════════════════════════════════════════════════════════════════════════════════════
// writes — create / update / delete the caller's own todos (rate-limited free tier, overflow:"credit"). 401 / 404 as above.
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /api/todos { title } → 201 { todo } — create a todo owned by the caller.
todos.route(effectRoute({
  method: "post", path: "/api/todos", name: "createTodo",
  summary: "Create a todo (owned by the signed-in user).",
  tags: ["Todos"], scopes: ["todo:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  request: { json: CreateReq },
  ok: { status: 201, schema: TodoBody, description: "The created todo." },
  errors: [UnauthorizedError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const { title } = yield* Effect.promise(() => c.req.json<{ title: string }>());
    const s = yield* Todo;
    return { todo: yield* s.create(userId, { title }) };
  }).pipe((p) => provide(c.env, p)),
}));

// PATCH /api/todos/:id { title?, completed? } → 200 { todo } — patch a todo the caller OWNS; absent/non-owned → 404.
todos.route(effectRoute({
  method: "patch", path: "/api/todos/:id", name: "updateTodo",
  summary: "Update a todo the signed-in user owns (title and/or completed).",
  tags: ["Todos"], scopes: ["todo:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  request: { json: UpdateReq },
  ok: { status: 200, schema: TodoBody, description: "The updated todo." },
  errors: [UnauthorizedError, NotFoundError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
    const id = c.req.param("id")!;
    const patch = yield* Effect.promise(() => c.req.json<{ title?: string; completed?: boolean }>());
    const s = yield* Todo;
    const item = yield* s.update(userId, id, patch);
    if (!item) return yield* new NotFoundError({ resource: "todo", id });
    return { todo: item };
  }).pipe((p) => provide(c.env, p)),
}));

// DELETE /api/todos/:id → 200 { deleted: true } — delete a todo the caller OWNS; absent/non-owned → 404.
todos.route(effectRoute({
  method: "delete", path: "/api/todos/:id", name: "deleteTodo",
  summary: "Delete a todo the signed-in user owns.",
  tags: ["Todos"], scopes: ["todo:write"], cost: COST_WRITE,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: DeletedBody, description: "The todo was deleted." },
  errors: [UnauthorizedError, NotFoundError],
  run: (c) => Effect.gen(function* () {
    const userId = caller(c);
    if (!userId) return yield* new UnauthorizedError({ reason: "authentication required" });
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
