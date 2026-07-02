[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [Registry](../../Registry.md) / [Services](../Services.md) / logs

# Activity log — Effect service (fully owned)

**A fully-owned Effect-TS activity log over one append-only table: record an action, read or filter a principal's recent activity. No `@suluk` logic package — the whole module is yours to extend.**

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf. This is a [shadcn registry](https://ui.shadcn.com/docs/registry/github)
> item — code you own, not an npm dependency.

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/logs
# pin to a ref:  MahmoodKhalil57/suluk/logs#main
```

`registryDependencies` pull in [`app`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/services/app) (the base Hono app + the Effect `Db` service) automatically.

## What you get

Four files drop into your app; every one is yours to edit.

| file → target | what it is |
| --- | --- |
| `logs.service.ts` → `src/services/logs.ts` | the **`Logs` Effect service** — `Context.Tag` + `LogsLive` layer, wraps the shared `Db` |
| `logs.routes.ts` → `src/routes/logs.ts` | **Hono routes** over the service — `logsRoutes()` |
| `logs.schema.ts` → `src/db/logs.ts` | the **owned `activity_log` table** — the Drizzle schema `activityLog` |
| `logs.provision.ts` → `provision/logs.ts` | the **provision fragment** — the `activity_log` migration on the shared app D1 |

### The Effect service (`Logs`)

A `Context.Tag("Logs")` with a `LogsLive` layer that injects the `Db` service from `app`. Four operations:

- **`record({ userId?, action, detail? })`** — append one row (`detail` is JSON-encoded, or null).
- **`recent({ userId?, limit? })`** — a principal's newest activity (defaults to 100 rows, newest first).
- **`query(q?)`** — the filtered slice over a **closed `LogQuery` whitelist**: `userId` (exact), `action`
  (exact, or `~substring` via a leading `~`), `since` (a ms-since-epoch lower bound on `createdAt`). Every
  value compiles to a **bound Drizzle parameter**, so user text never reaches SQL as text.
- **`timeseries(q?)`** — a coarse count-per-`action` histogram over the same filtered slice.

### The routes (`logsRoutes()`)

A Hono router — mount it with `app.route("/logs", logsRoutes())`. Each handler builds an Effect program,
provides `LogsLive` + `DbLive(env)`, and runs it:

- `GET /logs?userId=&limit=` → recent activity.
- `GET /logs/query?userId=&action=&since=&limit=` → the filtered slice (`action` may lead with `~` for a
  substring match; `since` is a ms-since-epoch lower bound).

### The schema (`activityLog`)

One append-only SQLite/D1 table — `id`, `userId`, `action`, JSON `detail`, `createdAt` — owned outright.
Add columns, indexes, or an FK to your `user` table freely.

### The provision fragment (`logsProvision`)

An `InstanceSpec[]` that adds the `activity_log` `CREATE TABLE` migration (`0002_logs`) to the shared app
database (`ref: "db"`). Merge it into your `provision.config.ts` and run `@suluk/provision` (`plan` / `apply`)
so modules stack migrations onto **one** D1, not many.

## Dependencies

- **npm** (`dependencies`): `@suluk/provision` (the `InstanceSpec` type for the provision fragment),
  `effect`, `drizzle-orm`, `hono`.
- **registry** (`registryDependencies`): [`app`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/services/app) — supplies the `Db` / `DbLive` Effect service and
  the `Bindings` type the routes run over.

## Own the wiring, npm the logic

This module is the exception to the [hybrid rule](https://github.com/MahmoodKhalil57/suluk/blob/main/registry/services/README.md#the-hybrid-rule): **there is no `@suluk`
logic package behind it — you own the whole thing.** The service, routes, schema, and migration are all
yours to extend; the only `@suluk` npm dependency, `@suluk/provision`, is pulled in solely for the
`InstanceSpec` type used to declare the table.

Because an activity log is generic plumbing (no money path, no security invariant to keep uniform across
consumers), there is nothing to centralize — so nothing is. The bound-parameter query discipline in the
service is carried inline, not deferred to a package. Fork it however your app needs.

## License

Apache-2.0
