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
| `todo.service.ts` | `src/services/todo.ts` | the `Todo` Effect service — `list`/`get`/`create`/`update`/`remove`, every method **owner-scoped** |
| `todo.routes.ts` | `src/routes/todo.ts` | the `routeGroup` envelope — 5 `effectRoute` CRUD ops + `todoOps`/`todoRoutes` |
| `todo.provision.ts` | `provision/todo.ts` | the `0008_todo` migration on the app D1 |

## The surface (`/api/todos`)

| op | method + path | scope | success | notes |
|---|---|---|---|---|
| `listTodos` | `GET /api/todos` | `todo:read` | 200 | the caller's list, newest first |
| `getTodo` | `GET /api/todos/:id` | `todo:read` | 200 | 404 for a non-owned/absent id |
| `createTodo` | `POST /api/todos` | `todo:write` | 201 | body `{ title }` |
| `updateTodo` | `PATCH /api/todos/:id` | `todo:write` | 200 | body `{ title?, completed? }` |
| `deleteTodo` | `DELETE /api/todos/:id` | `todo:write` | 200 | `{ deleted: true }` |

- **Only signed-in users** — each route reads the authenticated principal off `c.get("user")` and returns a typed
  **401 `UnauthorizedError`** when there is none; an anonymous caller never reaches the data.
- **Owner-scoped** — that principal is the owner in every query (never a client id), so a caller only touches THEIR OWN
  todos; a non-owned id is a typed **404 `NotFoundError`**.
- **Metered + rate-limited** — every route declares its cost + rate budget inline, so `@suluk/cost` meters + attributes the
  usage (per-user µ$) and `@suluk/scalar` renders it. Reads + writes settle `rate-limited` (a free tier, capped by the
  per-route window + the rate-credit µ$ bucket); writes declare `overflow:"credit"` (usage beyond the free tier is paid by
  credits — advisory: metered here, no inline debit, the same posture as every other write in the registry).

Add it to `platform.config.ts` (`todoService` in `services`, and an `erase-todo` wire so account erasure drops a user's
todos), then regenerate.
