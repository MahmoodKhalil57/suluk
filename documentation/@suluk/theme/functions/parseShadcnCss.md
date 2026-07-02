[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / parseShadcnCss

# Function: parseShadcnCss()

> **parseShadcnCss**(`css`, `name?`): \{ `dark`: [`ColorTokens`](../interfaces/ColorTokens.md); `light`: [`ColorTokens`](../interfaces/ColorTokens.md); `name`: `string`; \} \| `null`

Defined in: [parse-css.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/theme/src/parse-css.ts#L55)

Parse a shadcn/tweakcn theme CSS string into light + dark ColorTokens. Dark is read from a `.dark` /
 `html[data-theme="dark"]` block when present, otherwise deterministically derived from light. Returns null when
 the CSS has no recognizable `:root` shadcn token block.

## Parameters

### css

`string`

### name?

`string` = `""`

## Returns

\{ `dark`: [`ColorTokens`](../interfaces/ColorTokens.md); `light`: [`ColorTokens`](../interfaces/ColorTokens.md); `name`: `string`; \} \| `null`
