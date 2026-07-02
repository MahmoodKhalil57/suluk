[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / defineLocales

# Function: defineLocales()

> **defineLocales**\<`C`\>(`config`): `C`

Defined in: [locale.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/i18n/src/locale.ts#L36)

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
