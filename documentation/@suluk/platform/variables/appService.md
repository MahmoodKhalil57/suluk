[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / appService

# Variable: appService

> `const` **appService**: `object`

Defined in: [service.ts:202](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L202)

The 19 CORE services, expressed through the common interface (the dogfood). Ported field-for-field from the C051 CATALOG;
`auth` and `credits` additionally declare their composition surface (the `auth.onUserCreated` port + the
`credits.grantOnSignup` capability) — inert until the Phase-3 engine consumes them, and the render/build templates are
PROVISIONAL (Phase 3 pins them against the real auth seam signature, see ADR C053 open question #1).

## Type Declaration

### env

> `readonly` **env**: \[\{ `hint`: `"comma-separated browser origins allowed on /api/* (CORS)"`; `name`: `"TRUSTED_ORIGINS"`; \}, \{ `hint`: `"CF account-scoped master token (Workers Scripts + D1 + KV Edit) — mints the scoped tokens + provisions, then DELETED (never in git)"`; `name`: `"CLOUDFLARE_API_TOKEN"`; `provisioning`: `true`; `required`: `true`; `secret`: `true`; \}, \{ `hint`: `"CF account id — a KEEPER (routine scoped-token ops need it), kept encrypted in .env"`; `name`: `"CLOUDFLARE_ACCOUNT_ID"`; `required`: `true`; `secret`: `true`; `surface`: `"local"`; \}, \{ `hint`: `"scoped: D1 Write (migrations)"`; `minted`: `true`; `name`: `"CLOUDFLARE_D1_TOKEN"`; `secret`: `true`; \}, \{ `hint`: `"scoped: Workers Scripts Write (deploy + secret put)"`; `minted`: `true`; `name`: `"CLOUDFLARE_WORKERS_TOKEN"`; `secret`: `true`; \}, \{ `hint`: `"scoped: KV Write (rate-limit / rate-credit namespaces)"`; `minted`: `true`; `name`: `"CLOUDFLARE_KV_TOKEN"`; `secret`: `true`; \}\]

### id

> `readonly` **id**: `"app"` = `"app"`

### mount

> `readonly` **mount**: `object`

#### mount.kind

> `readonly` **kind**: `"base"` = `"base"`
