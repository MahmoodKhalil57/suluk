[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / parseOklch

# Function: parseOklch()

> **parseOklch**(`input`): [`Oklch`](../interfaces/Oklch.md) \| `null`

Defined in: [oklch.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/theme/src/oklch.ts#L49)

Parse a CSS `oklch(L C H)` / `oklch(L C H / A)` string. Percentages on L are normalized (50% → 0.5). Null on miss.

## Parameters

### input

`string`

## Returns

[`Oklch`](../interfaces/Oklch.md) \| `null`
