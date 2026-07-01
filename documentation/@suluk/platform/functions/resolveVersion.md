[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / resolveVersion

# Function: resolveVersion()

> **resolveVersion**(`dep`): `string`

Defined in: [catalog.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/catalog.ts#L53)

Resolve a dep to its version: an @suluk/* package → "latest" (fixes flow via `bun update`); a known ecosystem dep →
 its pinned range; anything else → "latest" (a best-effort default).

## Parameters

### dep

`string`

## Returns

`string`
