[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / toTailwindTheme

# Function: toTailwindTheme()

> **toTailwindTheme**(`spec`): `string`

Defined in: [emit.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/theme/src/emit.ts#L44)

The Tailwind v4 `@theme inline` block — maps each token to its utility variable (`--color-background`,
`--radius-lg`, `--font-sans`, breakpoints) referencing the `:root` custom properties, so Tailwind utilities
(`bg-background`, `rounded-lg`) resolve to the same source the CSS vars define.

## Parameters

### spec

[`TokenSpec`](../interfaces/TokenSpec.md)

## Returns

`string`
