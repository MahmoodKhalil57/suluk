[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [Registry](../../Registry.md) / [Foundation](../Foundation.md) / app

# Hono app + Effect runtime seam

The base Hono app plus the Effect-TS `Db` service every feature module builds on — the foundation the whole registry chains off.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/app
```

This is the root of the registry — every other module lists it in `registryDependencies`, so
`shadcn add credits` (or `keys`, `billing`, …) pulls `app` in automatically. Add it directly only
when you want the bare foundation.

## What you get

One file, `registry/app/app.ts` → `src/app.ts`, delivered into your repo and yours to edit. It
targets Cloudflare Workers (a D1 binding) and provides:

- **`createApp()`** — the base `Hono<{ Bindings }>` app. Applies credentialed CORS on `/api/*`
  (echoes a **trusted** browser origin, never `"*"`), serves `GET /health` + `GET /api/health`, and
  installs the top-level `onError` → JSON-500 handler. Feature modules mount onto it:
  `app.route("/credits", creditsRoutes())`.
- **`Db`** — the database as an Effect service (`Context.Tag("Db")` over `DrizzleD1Database`). Every
  feature service depends on it, so services never reach for a global handle.
- **`DbLive(env)`** — builds the `Db` layer for one request from the Worker bindings
  (`Layer.succeed(Db, drizzle(env.DB))`). A module's routes provide this + the module's own layer,
  then run the Effect program.
- **`Bindings`** — the Worker env interface (`DB: D1Database`, `TRUSTED_ORIGINS?`).
- **`trustedOrigins(env)`** — parses the comma-separated `TRUSTED_ORIGINS` allowlist; keep it in sync
  with the `trustedOrigins` you pass to auth's `mountAuthRoutes` (one source of truth).
- **`App`** — `ReturnType<typeof createApp>`, the app type modules type their `.route(...)` against.

No owned schema and no provision fragment — this is the runtime seam, not a feature. Modules that
need infra add their own `provision/*.ts` fragments against the shared `ref: "db"` database.

## Dependencies

- **npm** (`dependencies`): `hono`, `effect`, `drizzle-orm`, and
  [`@suluk/core`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/tooling/ts/packages/core) — the v4 foundation library (document parse /
  validate / by-name reference resolution / the ADA request matcher, plus the shared RFC-9457
  `ProblemDetails` error contract) that downstream modules read.
- **registry** (`registryDependencies`): none — `app` is the base of the chain.

## Own the wiring, npm the logic

`app.ts` is **the wiring you own**: the Hono instance, the CORS/origin policy, the health routes, the
per-request `Db` layer, and the error handler — all yours to edit once `shadcn add` drops them in.
The correctness-bearing logic stays upstream: the OpenAPI v4 document + error algebra live in the
`@suluk/core` npm package (and each feature module deps its own `@suluk/*` package for the money /
security / protocol core), so a fix there flows to you via npm while a forked core never happens.
