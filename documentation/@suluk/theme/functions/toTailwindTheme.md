[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / toTailwindTheme

# Function: toTailwindTheme()

> **toTailwindTheme**(`spec`): `string`

Defined in: [emit.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/theme/src/emit.ts#L44)

The Tailwind v4 `@theme inline` block — maps each token to its utility variable (`--color-background`,
`--radius-lg`, `--font-sans`, breakpoints) referencing the `:root` custom properties, so Tailwind utilities
(`bg-background`, `rounded-lg`) resolve to the same source the CSS vars define.

## Parameters

### spec

[`TokenSpec`](../interfaces/TokenSpec.md)

## Returns

`string`
