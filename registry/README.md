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

- Source is grouped by **stratum**: `registry/<category>/<item>/`, where `<category>` is one of
  **foundation → services → derivation → surfaces** (the dependency order the platform generator's `requires` guard
  enforces — a surface needs its derivation, which aggregates services, on the foundation). `registry.json` maps each
  file's `path` (repo source) → `target` (consumer dest); the install command is name-based (`add …/<item>`), so the
  folder move never changes how you consume an item.
- **Provision fragment:** every module that needs infra exports an `InstanceSpec[]`
  (`registry/<category>/<item>/<item>.provision.ts`) — the D1/KV/connector it needs. The shared app database is
  `ref: "db"`, so modules add migrations to ONE database.
- **Deps:** `dependencies` = npm (incl. the `@suluk/*` logic); `registryDependencies` = other modules (chaining + order).

## Items (by stratum)

**foundation/** — the base every app rests on:
- `app` — base Hono app + the Effect `Db` service (`@suluk/core`).

**services/** — the owned feature modules (add the ones you need; `requires` pulls their peers):
- `auth` — Better Auth mount + `CurrentUser` service (`@suluk/better-auth`) · `keys` — key lineage / cascade revoke / pooled headroom (`@suluk/keys`)
- `credits` — atomic ledger (balance / debit / idempotent grant, `@suluk/credits`) · `cost` — per-event cost (`@suluk/cost`) · `billing` — Stripe customer / Payment-Element / portal (`@suluk/billing` + `@suluk/payments`)
- `rate-limit` · `rate-credit` — request + credit rate limits · `i18n` — localization · `email` — transactional email · `webhooks` — outbound webhooks · `logs` — activity log · `erasure` — GDPR account-erasure cascade

**derivation/** — derived from the installed modules:
- `contract` — the v4 contract keystone (doc projection + scope gate) · `audit` — readiness/security audit over the contract · `journeys` — runnable BDD over the contract

**surfaces/** — caller-, agent-, and admin-facing projections:
- `reference` — the v4 API reference page · `mcp` — the agent (MCP) tool surface · `admin` — the admin API

`auth`'s schema is a Better-Auth-v1 SCAFFOLD — regenerate with `npx @better-auth/cli generate` for byte-exactness. The
[C051](../doc/architecture/decisions/C051-platform-generator-autotoolfactory.md) generator assembles a whole platform
from one `platform.config.ts` (the one-shot `autotoolfactory`).
