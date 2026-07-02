[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / parseScopes

# Function: parseScopes()

> **parseScopes**(`permissions`): `string`[]

Defined in: [packages/keys/src/scopes.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/keys/src/scopes.ts#L10)

permissions JSON (`{resource:[actions]}`) → flat `["resource:action"]` scopes, defensively (a bad value → no scopes).

## Parameters

### permissions

`string` \| `null`

## Returns

`string`[]
