[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [Registry](../../Registry.md) / [Services](../Services.md) / cost

# Cost ledger — runtime metering + µ$ projections

> An Effect-TS Cost service that persists live-request + fired-event costs into D1 and reads the raw ledger picture back — you own the D1 seam, `@suluk/cost` owns the projection + attribution algebra.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/cost
# or: npx shadcn@latest add MahmoodKhalil57/suluk/cost
# registryDependencies (app) are pulled in automatically; npm deps install.
```

## What you get

Four files drop into your app — the Effect service, its Hono routes, the owned schema, and the
provision fragment:

- **`src/services/cost.ts`** — the `Cost` Effect service (`Context.Tag` + `CostLive` layer), wrapping
  `@suluk/cost` over the shared `Db` service from `app`:
  - `record(event)` — persist a measured live-request `CostEvent` (the `costMeter` sink path) → a `cost_event` row.
  - `recordEvent(input)` — persist a **fired** background-event cost (webhook/cron/queue): build via
    `eventCostEvent` (attribution + reconciled amount + dedupe key), then claim `cost_dedup`
    at-least-once before recording. Returns `{ recorded }` (`false` ⇒ a duplicate redelivery).
  - `summary()` — the aggregate ledger via `summarize` (total + by principal/operation/action/source).
  - `principalSummary(userId)` — what **one** principal cost you, via `principalCost`.
- **`src/routes/cost.ts`** — `costRoutes()`, Hono over the service. Mount with `app.route("/cost", costRoutes())`:
  - `GET /cost/summary` — the aggregate ledger picture.
  - `GET /cost/summary/:userId` — the per-principal picture.
  - `POST /cost/event` — record a measured live-request `CostEvent` (internal: the metering middleware's sink).
  - `POST /cost/dedup` — record a fired background-event cost, idempotent on the model's dedupe key (`201` new / `200` duplicate).
- **`src/db/cost.ts`** — the two owned Drizzle tables:
  - `cost_event` — one row per recorded request/background cost (`operation`, `action`, `trigger`,
    `totalMicroUsd`, `reconciled`, per-source `breakdown` JSON, `createdAt`).
  - `cost_dedup` — the at-least-once dedup keys, so a redelivered webhook can't double-charge.
- **`provision/cost.ts`** — `costProvision`, an `InstanceSpec[]` fragment adding the `0003_cost`
  migration (both tables) to the shared app database (`ref: "db"`). Merge it into your
  `provision.config.ts` alongside `credits`/`keys`/`billing` and run `@suluk/provision` (`plan`/`apply`).

## Dependencies

- **npm (`dependencies`):** `@suluk/cost` (the storage-agnostic cost algebra), `@suluk/provision`,
  `effect`, `drizzle-orm`, `hono`.
- **registry (`registryDependencies`):** `MahmoodKhalil57/suluk/app` — the base Hono app + the Effect
  `Db` service the layer composes over (`Layer.provide(CostLive, DbLive(env))`).

## Own the wiring, npm the logic

This module **owns** the D1 seam: the `cost_event` + `cost_dedup` tables, the row ↔ `CostEvent`
mapping, the dedup claim, the routes, and the provision fragment — all yours to edit. The
money-moving logic stays **npm**: `@suluk/cost` keeps the projection (`summarize` / `principalCost`,
integer micro-USD throughout), the background-event attribution + reconciliation (`eventCostEvent`,
with `at` passed in for reproducibility), and the dedupe-key resolution off the payload. A
correctness fix to the cost algebra flows to you via `npm`; a forked money path never happens.

See [`@suluk/cost`](https://github.com/MahmoodKhalil57/suluk/tree/main/tooling/ts/packages/cost) for
the upstream contract facet + runtime meter, and the [registry README](https://github.com/MahmoodKhalil57/suluk/blob/main/registry/services/README.md) for the hybrid
own-the-code pattern.
