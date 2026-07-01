[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / toTailwindTheme

# Function: toTailwindTheme()

> **toTailwindTheme**(`spec`): `string`

Defined in: [emit.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/theme/src/emit.ts#L44)

The Tailwind v4 `@theme inline` block — maps each token to its utility variable (`--color-background`,
`--radius-lg`, `--font-sans`, breakpoints) referencing the `:root` custom properties, so Tailwind utilities
(`bg-background`, `rounded-lg`) resolve to the same source the CSS vars define.

## Parameters

### spec

[`TokenSpec`](../interfaces/TokenSpec.md)

## Returns

`string`
