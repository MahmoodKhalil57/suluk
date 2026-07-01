[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / toTailwindTheme

# Function: toTailwindTheme()

> **toTailwindTheme**(`spec`): `string`

Defined in: [emit.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/theme/src/emit.ts#L44)

The Tailwind v4 `@theme inline` block — maps each token to its utility variable (`--color-background`,
`--radius-lg`, `--font-sans`, breakpoints) referencing the `:root` custom properties, so Tailwind utilities
(`bg-background`, `rounded-lg`) resolve to the same source the CSS vars define.

## Parameters

### spec

[`TokenSpec`](../interfaces/TokenSpec.md)

## Returns

`string`
