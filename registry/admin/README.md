# Admin — ops/usage stats over the credit ledger

An Effect-TS Admin service exposing `GET /api/admin/stats` — the admin-scoped ops/usage aggregate over your credit ledger.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/admin
# or: npx shadcn@latest add MahmoodKhalil57/suluk/admin
```

`registryDependencies` pull in `app` automatically. The files drop into `src/services/admin.ts` +
`src/routes/admin.ts` and the npm deps install.

## What you get

Two files you own, wiring one read-only admin route over the `@suluk/credits` aggregate:

- **`src/services/admin.ts`** — the `Admin` Effect service (`Context.Tag` + `AdminLive` layer). Its
  one method `stats()` composes `ledgerStats(db)` (the generic ledger aggregate from npm) with a
  module-owned `count()` over the `creditTransaction` table, returning an `AdminStats` — the
  `LedgerStats` shape (`creditsIssued`, `creditsSpent`, `balanceOutstanding`) plus `transactions`,
  with an optional `users?` slot left for you to fill once your auth schema is wired (the app owns
  the `user` table). Depends on the shared `Db` service from `app`; compose it with
  `Layer.provide(AdminLive, DbLive(env))`.
- **`src/routes/admin.ts`** — `adminRoutes()`, a Hono router over the `Admin` service. Mount it with
  `app.route("/api/admin", adminRoutes())`. `GET /api/admin/stats` builds an Effect program,
  provides `AdminLive` + `DbLive(env)`, runs it, and returns `{ stats }`. The route does **no
  gating** — admin-scope is enforced globally by the contract's `enforceApiKeyScope` on `/api/admin`.

A **stateless read**: no schema and no provision fragment — it reads existing tables (the
`credit_transaction` table the `credits` module already owns).

## Dependencies

- **npm** (`dependencies`): `@suluk/credits`, `effect`, `drizzle-orm`, `hono`.
- **registry** (`registryDependencies`): `MahmoodKhalil57/suluk/app` — the base Hono app + the shared
  Effect `Db` service. For the route's admin-scope enforcement and to have a populated ledger to
  read, you'll typically also have the `contract` and `credits` modules installed.

## Own the wiring, npm the logic

You own the **service seam and the route** — the composable `Admin` layer, the shape of `AdminStats`,
and the freedom to fold in your own owned counts (the `transactions` count is added here; `users` is
yours to compose once auth is wired). The **ledger aggregate stays upstream** in
[`@suluk/credits`](../../tooling/ts/packages/credits) — `ledgerStats` computes credits issued vs
spent and outstanding balance directly from the ledger deltas, so a correctness fix to that aggregate
flows to you via npm rather than living in a forked copy.
