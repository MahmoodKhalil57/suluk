[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [Registry](../../Registry.md) / [Services](../Services.md) / keys

# Hierarchical API keys — pooled headroom + cascade revoke

An Effect-TS `Keys` service over [`@suluk/keys`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/tooling/ts/packages/keys) — the delegation
tree for hierarchical API keys: a lineage subtree, cascade revoke, and the pooled headroom over a
chain. The abuse-proof cap algebra stays upstream; you own the wiring.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative.

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/keys
# npx shadcn@latest add MahmoodKhalil57/suluk/keys
# registryDependencies (app, auth, credits) are pulled in automatically
```

The files land in your app (`src/services/keys.ts`, `src/routes/keys.ts`, `src/db/keys.ts`,
`provision/keys.ts`) and the npm deps install. Then merge `provision/keys.ts` into your
`provision.config.ts` and run [`@suluk/provision`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/tooling/ts/packages/provision).

## What you get

- **`keys.service.ts` → `src/services/keys.ts`** — the `Keys` Effect service (`Context.Tag` +
  `KeysLive` `Layer`) over `@suluk/keys`. It exposes `subtree` (descendant key ids), `revokeTree`
  (cascade-revoke a key + its whole subtree, fail-closed), `headroom` (the pooled subtree cap for a
  chain), `effectiveCaps` (the pure scope-∩ / cap-min / soonest-expiry down a chain), and
  `provision` (mint a delegated child, caps **clamped** to the parent's — abuse-proof — with the
  lineage recorded). It depends on the shared `Db` service (`app`) and two injected hooks:
  `DisableKeys` (soft-disable rows in the `apikey` table) and `CreateKey` (the real Better-Auth mint).
- **`keys.routes.ts` → `src/routes/keys.ts`** — the Hono routes. `GET /keys/:keyId/subtree` returns
  the descendant ids; `POST /keys/:keyId/revoke` cascade-revokes the subtree; `POST /keys/provision`
  mints a delegated child (caps clamped to the parent) and returns the plaintext key **once**. Mount
  with `app.route("/keys", keysRoutes())`. Ships a default `DisableKeys` (`UPDATE apikey SET
  enabled = 0`) and a `CreateKey` stub that **throws until you wire it** to
  `auth.api.createApiKey` (minting a valid hashed/prefixed key is Better Auth's job).
- **`keys.schema.ts` → `src/db/keys.ts`** — re-exports `keyLineage` from `@suluk/keys` (the package
  owns the materialized-path table). The `apikey` table itself is Better Auth's, from the apikey
  plugin in `auth`.
- **`keys.provision.ts` → `provision/keys.ts`** — the `keysProvision` `InstanceSpec[]` fragment: the
  `key_lineage` table on the shared app D1 (`ref: "db"`), migration `0001_keys`.

Key **creation** is Better Auth's apikey plugin (the `auth` module); this module manages the
delegation tree that hangs off it.

## Dependencies

- **npm:** `@suluk/keys` (the algebra + lineage queries), `@suluk/provision`, `effect`,
  `drizzle-orm`, `hono`.
- **registry:** `MahmoodKhalil57/suluk/app` (the base app + `Db` service),
  `MahmoodKhalil57/suluk/auth` (the apikey plugin that mints keys + owns the `apikey` table),
  `MahmoodKhalil57/suluk/credits` (the ledger the pooled-headroom query joins) — pulled in
  automatically.

## Own the wiring, npm the logic

You **own** the `Keys` Effect service, the Hono routes, the `key_lineage` provision fragment, and
the two hooks (`DisableKeys`, `CreateKey`) — edit them freely. The **money/abuse-correctness core**
flows from [`@suluk/keys`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/tooling/ts/packages/keys) via npm: `effectiveCaps` (a child can
never out-scope or out-spend an ancestor), `chainHeadroom` / `pooledHeadroom` (a parent's cap bounds
its **whole subtree's** total spend, joined against the `@suluk/credits` ledger), `clampChildGrant`
(clamp a minted child to the parent's grant), and `revokeKeyTree` (the fail-closed cascade). A
correctness fix to the cap algebra flows to you through npm; a forked delegation path never happens.
