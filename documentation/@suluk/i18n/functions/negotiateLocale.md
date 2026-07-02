[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / negotiateLocale

# Function: negotiateLocale()

> **negotiateLocale**(`config`, `acceptLanguage`): `string`

Defined in: [locale.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/i18n/src/locale.ts#L84)

Negotiate the best supported locale from an `Accept-Language` header (q-weighted; exact then primary-subtag match).
Returns the default when nothing matches. Used as a fallback when no `locale` cookie is set.

## Parameters

### config

[`LocaleConfig`](../interfaces/LocaleConfig.md)

### acceptLanguage

`string` \| `null` \| `undefined`

## Returns

`string`
