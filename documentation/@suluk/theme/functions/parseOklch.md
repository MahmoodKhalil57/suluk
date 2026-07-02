[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / parseOklch

# Function: parseOklch()

> **parseOklch**(`input`): [`Oklch`](../interfaces/Oklch.md) \| `null`

Defined in: [oklch.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/theme/src/oklch.ts#L49)

Parse a CSS `oklch(L C H)` / `oklch(L C H / A)` string. Percentages on L are normalized (50% → 0.5). Null on miss.

## Parameters

### input

`string`

## Returns

[`Oklch`](../interfaces/Oklch.md) \| `null`
