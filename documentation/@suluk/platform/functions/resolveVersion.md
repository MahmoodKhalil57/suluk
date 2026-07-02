[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / resolveVersion

# Function: resolveVersion()

> **resolveVersion**(`dep`): `string`

Defined in: [catalog.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/catalog.ts#L53)

Resolve a dep to its version: an @suluk/* package → "latest" (fixes flow via `bun update`); a known ecosystem dep →
 its pinned range; anything else → "latest" (a best-effort default).

## Parameters

### dep

`string`

## Returns

`string`
