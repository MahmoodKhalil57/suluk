[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / parseScopes

# Function: parseScopes()

> **parseScopes**(`permissions`): `string`[]

Defined in: [packages/keys/src/scopes.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/keys/src/scopes.ts#L10)

permissions JSON (`{resource:[actions]}`) → flat `["resource:action"]` scopes, defensively (a bad value → no scopes).

## Parameters

### permissions

`string` \| `null`

## Returns

`string`[]
