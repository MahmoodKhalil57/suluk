[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / parseOklch

# Function: parseOklch()

> **parseOklch**(`input`): [`Oklch`](../interfaces/Oklch.md) \| `null`

Defined in: [oklch.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/theme/src/oklch.ts#L49)

Parse a CSS `oklch(L C H)` / `oklch(L C H / A)` string. Percentages on L are normalized (50% → 0.5). Null on miss.

## Parameters

### input

`string`

## Returns

[`Oklch`](../interfaces/Oklch.md) \| `null`
