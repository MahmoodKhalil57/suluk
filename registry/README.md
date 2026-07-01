# Suluk registry — own-the-code backend modules

A [shadcn registry](https://ui.shadcn.com/docs/registry/github) that distributes the **generic SaaS-backend modules** as
code you own, wired over the `@suluk/*` npm packages. `registry.json` (repo root) is read directly from GitHub — no
server, no publish. Architecture: [C050](../doc/architecture/decisions/C050-registry-distributed-framework.md); the
manifest-driven generator that assembles a whole platform from these: [C051](../doc/architecture/decisions/C051-platform-generator-autotoolfactory.md).

## Consume (the repo is public)

```bash
# add the base + a module (registryDependencies pull in `app` automatically)
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/credits
# pin to a ref:  MahmoodKhalil57/suluk/credits#main
```

Each module drops its files into your app (`src/services/*`, `src/routes/*`, `src/db/*`, `provision/*`) and installs its
npm deps. Then merge the `provision/*.ts` fragments into a `provision.config.ts` and run `@suluk/provision`
(`plan`/`apply`) to create the real backend services.

## Effect-TS services

Each feature module is an **Effect-TS service** — a `Context.Tag` + a `Layer` that wraps the `@suluk/*` logic — so services
compose via layers, inject their deps (the shared `Db` service from `app`), and surface typed errors. Routes build an
Effect program, provide the module layer + `DbLive(env)`, and run it.

## The hybrid rule

An item **owns the service wiring** (the Effect service, routes, schema re-export — yours to edit) but **deps the
`@suluk/*` package for the money/security-critical logic** (the atomic ledger, the pooled-cap key algebra, payments). A
correctness fix flows to you via npm; a forked money path never happens.

## Item conventions

- Source lives in `registry/<item>/`; `registry.json` maps each file's `path` (repo source) → `target` (consumer dest).
- **Provision fragment:** every module that needs infra exports an `InstanceSpec[]` (`registry/<item>/<item>.provision.ts`)
  — the D1/KV/connector it needs. The shared app database is `ref: "db"`, so modules add migrations to ONE database.
- **Deps:** `dependencies` = npm (incl. the `@suluk/*` logic); `registryDependencies` = other modules (chaining + order).

## Items

| item | what | logic (npm) |
|---|---|---|
| `app` | base Hono app + the Effect `Db` service | `@suluk/core` |
| `credits` | Credits service — balance / atomic debit / idempotent grant | `@suluk/credits` |
| `keys` | Keys service — lineage subtree, cascade revoke, pooled headroom | `@suluk/keys` |
| `billing` | Billing service — customer / Payment-Element + add-card sessions / cards / portal | `@suluk/billing` (+ `@suluk/payments`) |
| `logs` | activity log (fully owned Effect service) | — |

_Still to come: `auth` (Better Auth mount — the foundation), then `cost` / `journeys` / `audit`, then the C051 manifest
generator that assembles a whole platform from one document._
