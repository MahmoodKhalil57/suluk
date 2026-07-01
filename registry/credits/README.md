# Credit ledger — Effect service + metered debit

An Effect-TS Credits service (`Context.Tag` + `Layer`) that wraps the `@suluk/credits` npm logic and gives you the wiring you own — the Hono routes, the schema re-export, and a provision fragment for the D1 tables. The money-critical parts (the atomic debit that can't go negative, the idempotent grant) stay upstream.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/credits
# or:  npx shadcn@latest add MahmoodKhalil57/suluk/credits
# pin to a ref:  MahmoodKhalil57/suluk/credits#main
```

`registryDependencies` (here, `app`) are pulled in automatically, and the npm `dependencies` are installed. The files land in your app; the `@suluk/credits` logic comes down as an npm package.

## What you get

Four files drop into your app — all yours to edit:

- **`src/services/credits.ts`** (from `credits.service.ts`) — the `Credits` Effect service: a `Context.Tag` + the `CreditsLive` `Layer`. It depends on the `Db` service from `app` and exposes `balance(userId)`, `debit(userId, amount, reason)`, `grant(userId, amount, idemKey, reason?)`, and `transactions(userId)`. Compose it into your runtime with `Layer.provide(CreditsLive, DbLive(env))`.
- **`src/routes/credits.ts`** (from `credits.routes.ts`) — `creditsRoutes()`, a Hono router over the `Credits` service. Each handler builds an Effect program, provides `CreditsLive` + `DbLive(env)`, and runs it. Mount it: `app.route("/credits", creditsRoutes())`. Routes:
  - `GET /credits/balance/:userId` → `{ balance }`
  - `GET /credits/transactions/:userId` → `{ transactions }`
  - `POST /credits/debit` `{ userId, amount, reason }` — atomic metered debit; returns `402` when the balance can't cover it
  - `POST /credits/grant` `{ userId, amount, idemKey, reason }` — idempotent money-IN, safe to retry (keyed on `idemKey`)
- **`src/db/credits.ts`** (from `credits.schema.ts`) — re-exports the `creditTransaction`, `creditAmount`, and `creditKey` Drizzle tables from `@suluk/credits`. Your drizzle config + migrations import from here. `userId` is a plain column — add the FK to your `user` table in your migration if you want the cascade.
- **`provision/credits.ts`** (from `credits.provision.ts`) — `creditsProvision`, an `@suluk/provision` `InstanceSpec[]` fragment. It declares the shared app D1 (`ref: "db"`, `protected: true`) plus the `0000_credits` migration that creates `credit_transaction`, `credit_amount`, and `credit_key`. A platform merges every module's fragment into one `provision.config.ts`; because the `ref` is `"db"`, credits/keys/billing all add their migrations to the SAME database.

## Dependencies

**npm (`dependencies`):**

- [`@suluk/credits`](../../tooling/ts/packages/credits) — the ledger logic (see below)
- [`@suluk/provision`](../../tooling/ts/packages/provision) — the `InstanceSpec` type + `plan`/`apply`
- `effect` — the service/`Layer` runtime
- `drizzle-orm` — the schema + queries
- `hono` — the router

**Registry (`registryDependencies`):** `MahmoodKhalil57/suluk/app` — the base Hono app and the Effect `Db` service the routes and layer depend on.

## Own the wiring, npm the logic

This is the HYBRID pattern (ADR [C050](../../doc/architecture/decisions/C050-registry-distributed-framework.md)/[C052](../../doc/architecture/decisions/C052-npm-vs-registry-boundary.md)): you **own** the seam, and **npm** the money.

- **You own** the Effect service, the routes, the schema re-export, and the provision fragment. Edit them freely — add routes, change the mount path, wire the FK cascade, adjust the migration.
- **`@suluk/credits` owns** the money-correctness core, so its fixes flow to you via npm instead of forking into your app:
  - `debitIfCovers` — a single conditional `INSERT` that can **never drive the ledger negative** under concurrency (returns `false` instead of overdrawing); this is what the `debit` route runs.
  - `grantOnce` — idempotent on the idempotency key, so a redelivered signup / top-up event never grants twice; this is what the `grant` route runs.
  - `getBalance` (Σ of the user's ledger deltas) and `listTransactions` (the activity log) back the two `GET` routes.
  - The package also **owns the tables** (`creditTransaction` / `creditAmount` / `creditKey`), which is why the schema file just re-exports them.

A correctness fix in the ledger reaches every consumer as a version bump; a forked money path never happens.
