# todo

A complete, fully-owned CRUD module — per-user todo items with **sign-in-only, owner-scoped** access, **metered +
rate-limited** usage, and a **drizzle** schema that bubbles up into the contract.

```bash
shadcn add MahmoodKhalil57/suluk/todo
```

## What you get

| file | target | what |
|---|---|---|
| `todo.schema.ts` | `src/db/todo.ts` | the drizzle `todo` table (`id`, `userId`, `title`, `completed`, `createdAt`, `updatedAt` + owner index) |
| `todo.ops.ts` | `src/services/todo.ts` | the CRUD **ops** — each a sulukts `op` (`list`/`get`/`create`/`update`/`delete` + `count`) declaring its whole operation (method/path/roles/contract) + impl **directly over `Db`**, every query **owner-scoped**. No wrapper `Context.Tag` service |
| `todo.routes.ts` | `src/routes/todo.ts` | the `routeGroup` envelope — mounts the ops (identity bubbles from each op's `meta`) + the recursive `getTodoDetail` composition + `todoOps`/`todoRoutes` |
| `todo.provision.ts` | `provision/todo.ts` | the `0008_todo` migration on the app D1 |

## The surface (`/api/todos`)

| op | method + path | scope | success | notes |
|---|---|---|---|---|
| `listTodos` | `GET /api/todos` | `todos:read` | 200 | the caller's list, newest first |
| `getTodo` | `GET /api/todos/:id` | `todos:read` | 200 | 404 for a non-owned/absent id |
| `createTodo` | `POST /api/todos` | `todos:write` | 201 | body `{ title }` |
| `updateTodo` | `PATCH /api/todos/:id` | `todos:write` | 200 | body `{ title?, completed? }` |
| `deleteTodo` | `DELETE /api/todos/:id` | `todos:write` | 200 | `{ deleted: true }` |
| `getTodoDetail` | `GET /api/todos/:id/detail` | `todos:read` | 200 | **recursive** `all(getTodo, countTodos)` → `{ todo, count }` (one endpoint, merged contract, summed cost) |

The functions ARE the composable units: each op declares its whole v4 operation and runs over `Db` directly (no separate
service). A route mounts an op (`effectPipeRoute({ provide, pipeline: pipeline(getTodo) })` — method/path/roles come from the
op's `meta`) or COMPOSES ops with `seq`/`all`/`branch`, and the whole contract (request/response/errors/cost/rate-limit)
bubbles up into one route.

- **Only signed-in users** — each route reads the authenticated principal off `c.get("user")` and returns a typed
  **401 `UnauthorizedError`** when there is none; an anonymous caller never reaches the data.
- **Owner-scoped** — that principal is the owner in every query (never a client id), so a caller only touches THEIR OWN
  todos; a non-owned id is a typed **404 `NotFoundError`**.
- **Metered + rate-limited (DERIVED)** — `roles:["signed-in"]` derives the `todos:<read|write>` scope, a method-based cost (settled `rate-limited`), a rate-limit (read 120/min · write 60/min, principal-keyed), and the typed 401 — so each route declares only its body schema + any domain 404. Everything derived stays overridable.

Add it to `platform.config.ts` (`todoService` in `services`, and an `erase-todo` wire so account erasure drops a user's
todos), then regenerate.
