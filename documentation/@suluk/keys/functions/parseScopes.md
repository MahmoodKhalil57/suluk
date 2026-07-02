[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / parseScopes

# Function: parseScopes()

> **parseScopes**(`permissions`): `string`[]

Defined in: [packages/keys/src/scopes.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/keys/src/scopes.ts#L10)

permissions JSON (`{resource:[actions]}`) → flat `["resource:action"]` scopes, defensively (a bad value → no scopes).

## Parameters

### permissions

`string` \| `null`

## Returns

`string`[]
