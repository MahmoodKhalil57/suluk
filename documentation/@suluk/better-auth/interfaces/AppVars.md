[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / AppVars

# Interface: AppVars

Defined in: [principal.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/principal.ts#L14)

The Hono context Variables the auth middleware POPULATES per `/api/*` request — the resolved caller (`c.get("user")`,
 `c.var.scopes`, and the api-key id/name for a keyed caller). A module that READS the auth-set principal (e.g. `mcp`)
 types its context off THIS shared shape instead of importing the app's `../auth` — so it needs no sibling import.

## Properties

### keyId?

> `optional` **keyId?**: `string`

Defined in: [principal.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/principal.ts#L17)

***

### keyName?

> `optional` **keyName?**: `string`

Defined in: [principal.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/principal.ts#L18)

***

### scopes?

> `optional` **scopes?**: `string`[]

Defined in: [principal.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/principal.ts#L16)

***

### user?

> `optional` **user?**: `object`

Defined in: [principal.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/principal.ts#L15)

#### email?

> `optional` **email?**: `string`

#### id

> **id**: `string`
