[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / [Registry](../Registry.md) / erasure

# GDPR erasure — fail-closed cascade + audit receipt

An Effect-TS Erasure service that runs an ordered delete/anonymize cascade when a user is erased, wired into Better Auth's `deleteUser.beforeDelete` hook and backed by an `erasure_receipt` audit row — the fail-closed orchestrator stays upstream in `@suluk/better-auth`.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/erasure
```

`registryDependencies` pulls in [`app`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/app) automatically (the base Hono app + the Effect `Db`
service the cascade builds on). The files land in your repo and are yours to edit.

## What you get

Four files, dropped into your app and owned by you:

- **`erasure.service.ts` → `src/services/erasure.ts`** — the owned wiring.
  - **`sulukCascade(db)`** — the default hard-DELETE cascade over the core Suluk tables
    (`activity_log`, `cost_event`, `billing_account`, `key_lineage`, `credit_transaction`), each
    keyed on `userId` and ordered leaf-first so a partial failure aborts before the load-bearing
    rows are touched. **Edit this** to match the modules you actually installed and to pick your
    posture (swap a `deleteStep` for an `anonymizeStep` where an FK-referenced row must survive
    while its PII is scrubbed).
  - **`erasureHook(db, opts?)`** — builds the Better Auth `user.deleteUser.beforeDelete` hook from
    the cascade; pass it into `buildAuth`'s `deleteUser.beforeDelete` so erasure fires whenever a
    user is deleted *through* auth (the proper integration).
  - **`Erasure` / `ErasureLive`** — the `Context.Tag` + `Layer` (depends on `Db`). `erase(userId,
    opts?)` runs the cascade fail-closed, then writes the receipt and returns `{ steps: string[] }`.
    A failed step throws and leaves **no** receipt.
  - Re-exports `step`, `deleteStep`, `anonymizeStep`, `CascadeStep`, `CascadeOptions` so your app
    composes its cascade without a second `@suluk/better-auth` import.
- **`erasure.routes.ts` → `src/routes/erasure.ts`** — `erasureRoutes()`, a Hono router over the
  `Erasure` service. Mount with `app.route("/erasure", erasureRoutes())`. It exposes
  `POST /erasure/:userId` as the manual/admin trigger — **gate this in production** (admin/self-only);
  a failed step returns 500 with no receipt written.
- **`erasure.schema.ts` → `src/db/erasure.ts`** — the one owned table, `erasure_receipt`
  (`id`, `userId`, `posture`, `steps`, `erasedAt`): the GDPR compliance audit trail, written **after**
  the cascade succeeds so an aborted erasure leaves no false "erased" record.
- **`erasure.provision.ts` → `provision/erasure.ts`** — `erasureProvision`, an `InstanceSpec[]`
  fragment adding the `erasure_receipt` migration (`0004_erasure`) to the shared `ref: "db"` D1
  database. Merge it into your `provision.config.ts`. The cascade DELETEs rows in the *other*
  modules' tables at runtime; those migrations belong to their own fragments.

## Dependencies

- **npm** (`dependencies`): [`@suluk/better-auth`](https://github.com/MahmoodKhalil57/suluk/tree/main/tooling/ts/packages/better-auth) (the
  cascade orchestrator + step constructors), [`@suluk/provision`](https://github.com/MahmoodKhalil57/suluk/tree/main/tooling/ts/packages/provision)
  (the `InstanceSpec` type for the fragment), `effect`, `drizzle-orm`, and `hono`.
- **registry** (`registryDependencies`): [`app`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/app) — the base Hono app and the `Db` Effect
  service the `Erasure` layer injects.

## Own the wiring, npm the logic

You **own the cascade shape**: which tables get erased, in what order, and with which posture
(delete vs anonymize) — plus the Effect service, the route, the owned `erasure_receipt` table, and the
provision fragment. That is exactly what should be per-app, because it depends on the modules you
installed.

The **fail-closed discipline stays upstream** in `@suluk/better-auth`'s `beforeDeleteCascade`: if any
step throws it **aborts** the whole cascade (rather than half-erasing and then deleting the user,
orphaning their external records), and it ships both `deleteStep` and `anonymizeStep` as thin labeled
constructors while imposing neither posture. So a correctness fix to the orchestrator flows to you via
npm, while a forked account-deletion path never happens.
