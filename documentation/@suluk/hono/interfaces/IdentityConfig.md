[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / IdentityConfig

# Interface: IdentityConfig

Defined in: [tooling/ts/packages/hono/src/enforce.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/hono/src/enforce.ts#L28)

Read identity from a request — the app supplies these (it owns its principal/scope model).

## Extended by

- [`EnforceAccessConfig`](EnforceAccessConfig.md)

## Properties

### isAdmin?

> `optional` **isAdmin?**: (`c`) => `boolean`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/hono/src/enforce.ts#L32)

fast-path admin check (verified). If omitted, the literal "admin" scope is used.

#### Parameters

##### c

`Context`

#### Returns

`boolean`

***

### principal

> **principal**: (`c`) => `string` \| `null` \| `undefined`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/hono/src/enforce.ts#L30)

the caller's verified principal id, or null/undefined for anonymous.

#### Parameters

##### c

`Context`

#### Returns

`string` \| `null` \| `undefined`

***

### scopes?

> `optional` **scopes?**: (`c`) => `string`[] \| `undefined`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/hono/src/enforce.ts#L34)

the caller's granted scopes (e.g. ["admin"], ["org:1:read"]). Default: none.

#### Parameters

##### c

`Context`

#### Returns

`string`[] \| `undefined`
