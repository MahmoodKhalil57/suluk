# todo

A complete, fully-owned CRUD module — per-user todo items with **sign-in-only, owner-scoped** access, **metered +
rate-limited** usage, a full **list-query surface** (pagination/sort/filter/search), and a **drizzle** schema that
bubbles up into the contract.

```bash
shadcn add MahmoodKhalil57/suluk/todo
```

## What you get

| file | target | what |
|---|---|---|
| `todo.schema.ts` | `src/db/todo.ts` | the drizzle `todo` table (`id`, `userId`, `title`, `completed`, `createdAt`, `updatedAt` + owner index) |
| `todo.model.ts` | `src/models/todo.ts` | one `queryOne`/`queryMany`/`mutate` per operation, each built from ONE query — its response schema, cost, and by-id 404 all derive from that query |
| `todo.ops.ts` | `src/services/todo.ts` | thin `sulukFmt` wrappers over the models — nothing restated, everything bubbles up |
| `todo.routes.ts` | `src/routes/todo.ts` | the `routeGroup` envelope — mounts a controller `sulukFmt`'d with each service + the recursive `getTodoDetail` fan-out + `todoOps`/`todoRoutes` |
| `todo.provision.ts` | `provision/todo.ts` | the `0008_todo` migration on the app D1 |

## The surface (`/api/todos`)

| op | method + path | scope | success | notes |
|---|---|---|---|---|
| `listTodos` | `GET /api/todos` | `todos:read` | 200 | paginated/sorted/filtered/searched — see below |
| `getTodo` | `GET /api/todos/:id` | `todos:read` | 200 | 404 for a non-owned/absent id |
| `createTodo` | `POST /api/todos` | `todos:write` | 201 | body `{ title }` |
| `updateTodo` | `PATCH /api/todos/:id` | `todos:write` | 200 | body `{ title?, completed? }` |
| `deleteTodo` | `DELETE /api/todos/:id` | `todos:write` | 200 | `{ deleted: true }` |
| `getTodoDetail` | `GET /api/todos/:id/detail` | `todos:read` | 200 | **fan-out** `sulukFmt.all({ todo: getTodo, count: countTodos })` → `{ todo, count }` (one endpoint, merged contract, summed cost) |

### `listTodos`'s query surface

- **Pagination** — `page`/`perPage` (clamped to a max, default 20/page).
- **Sort** — `sort=-createdAt,title` (comma-separated, `-` prefix for descending); omitted defaults to newest first.
- **Free-text search** — `q=milk` ORs a `contains` match across every string column.
- **SIMPLE filters** — flat params: `title=milk` (eq) or `title__contains=milk` (any of 13 closed operators via a
  `column__op` suffix), implicitly AND'd.
- **ADVANCED filters** — one JSON-encoded `filter` param carrying a recursive `and`/`or`/`not` tree of leaf
  conditions (Splunk-parity nesting) — a real Zod type, so it's JSON-Schema-describable in the generated doc, not
  an opaque string.
- The caller's owner scope is always the outermost `AND` term — no filter can ever widen past it — and any failure
  turning the request into SQL (a malformed `filter=`, or an operator invalid for its column's type) falls back to
  an unfiltered, owner-scoped, default-sorted page rather than erroring.

Every operation declares only what's genuinely its own (a domain error) — the response schema, the path-param and
request-body schemas, the 401/403/404, the summed cost, and the rate-limit all bubble up through `sulukFmt` from
the model that owns them. Nothing is restated at the service or route layer: a by-id model declares
`params: todo.zodSchema.pick({ id: true })` (the SAME nanoid format/description/example the column already
carries — never a hand-written `id: string`), and a route composes its service directly via `sulukFmt.relay(S.xxx,
{ method, path, roles, ... })` — `In`/`Out`/`R` are INFERRED from the service passed, so there is no `InputOf<typeof
S.xxx>` to write, no model import, no `z.infer<typeof X>` anywhere in the routes file. `params`/`body` are
auto-parsed, validated, and merged into ONE flat input object at the route boundary — a malformed path id is a
typed 400 before any handler runs, and a route like `updateTodo` just relays the merged `{ id, title?, completed?
}` straight through. (`getTodoDetail`, a `sulukFmt.all` fan-out, is the one exception `relay` doesn't fit — it
declares `params` directly on its own controller, since a fan-out's input is deliberately unconstrained.)

- **Only signed-in users** — each route reads the authenticated principal via `roles: ["signed-in"]`, returning a
  typed **401 `UnauthorizedError`** when there is none; an anonymous caller never reaches the data.
- **Owner-scoped** — that principal is the owner in every query (never a client-supplied id), so a caller only
  touches THEIR OWN todos; a non-owned id is a typed **404 `NotFoundError`**.
- **Metered + rate-limited (DERIVED)** — `roles: ["signed-in"]` derives the `todos:<read|write>` scope, a
  method-based cost (settled `rate-limited`), a rate-limit (read 120/min · write 60/min, principal-keyed), and the
  typed 401 — so each route declares only its body schema + any domain error. Everything derived stays overridable.

The whole surface — including `listTodos`'s query schema, every response/error shape, cost, rate-limit, and the
authored BDD `step`s — projects into one v4 OpenAPI document (`todoOps`, via `@suluk/hono`'s `emitV4`); feed that
document to `@suluk/journeys` to generate real, runnable Gherkin scenarios with zero hand-authored test scaffolding.

Add it to `platform.config.ts` (`todoService` in `services`, and an `erase-todo` wire so account erasure drops a
user's todos), then regenerate.
