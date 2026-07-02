[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / defineLocales

# Function: defineLocales()

> **defineLocales**\<`C`\>(`config`): `C`

Defined in: [locale.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/i18n/src/locale.ts#L36)

Define an app's locale set. Pass-through (preserves literal types under `<const>`) so callers get a precise
`LocaleCode<typeof config>` union AND the config to feed the loader/resolver/formatter.

## Type Parameters

### C

`C` *extends* [`LocaleConfig`](../interfaces/LocaleConfig.md)

## Parameters

### config

`C`

## Returns

`C`
