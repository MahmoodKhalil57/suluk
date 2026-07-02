[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / parseScopes

# Function: parseScopes()

> **parseScopes**(`permissions`): `string`[]

Defined in: [packages/keys/src/scopes.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/scopes.ts#L10)

permissions JSON (`{resource:[actions]}`) → flat `["resource:action"]` scopes, defensively (a bad value → no scopes).

## Parameters

### permissions

`string` \| `null`

## Returns

`string`[]
