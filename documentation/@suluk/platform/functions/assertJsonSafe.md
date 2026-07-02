[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / assertJsonSafe

# Function: assertJsonSafe()

> **assertJsonSafe**(`v`, `path?`): `void`

Defined in: [wire.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/wire.ts#L27)

Reject non-JSON data (functions/symbols/bigint/undefined) + prototype-pollution keys anywhere in a wire's params.

## Parameters

### v

`unknown`

### path?

`string` = `"with"`

## Returns

`void`
