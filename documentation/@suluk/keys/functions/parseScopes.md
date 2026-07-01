[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / parseScopes

# Function: parseScopes()

> **parseScopes**(`permissions`): `string`[]

Defined in: [packages/keys/src/scopes.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/keys/src/scopes.ts#L10)

permissions JSON (`{resource:[actions]}`) → flat `["resource:action"]` scopes, defensively (a bad value → no scopes).

## Parameters

### permissions

`string` \| `null`

## Returns

`string`[]
