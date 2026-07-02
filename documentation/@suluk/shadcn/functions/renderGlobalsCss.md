[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / renderGlobalsCss

# Function: renderGlobalsCss()

> **renderGlobalsCss**(`theme`, `opts?`): `string`

Defined in: [theme.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/shadcn/src/theme.ts#L31)

The shadcn `globals.css`: the Tailwind import + the `dark` custom-variant + the token vars (light at `:root`,
dark at the dark selector) + the `@theme inline` mapping + a base layer applying border/bg/text tokens.

## Parameters

### theme

[`TokenSpec`](../../theme/interfaces/TokenSpec.md) \| [`ThemeSpec`](../../theme/interfaces/ThemeSpec.md)

### opts?

[`ShadcnThemeOptions`](../interfaces/ShadcnThemeOptions.md) = `{}`

## Returns

`string`
