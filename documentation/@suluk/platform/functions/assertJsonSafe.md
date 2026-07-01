[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / assertJsonSafe

# Function: assertJsonSafe()

> **assertJsonSafe**(`v`, `path?`): `void`

Defined in: [wire.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/wire.ts#L27)

Reject non-JSON data (functions/symbols/bigint/undefined) + prototype-pollution keys anywhere in a wire's params.

## Parameters

### v

`unknown`

### path?

`string` = `"with"`

## Returns

`void`
