[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / formatCurrency

# Function: formatCurrency()

> **formatCurrency**(`config`, `code`, `value`, `currency`, `opts?`): `string`

Defined in: [format.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/i18n/src/format.ts#L27)

Format a MONEY amount. `value` is the major-unit number (e.g. dollars); for integer cents from @suluk/stripe,
pass `cents / 100`. Honors the locale's numbering system + currency conventions.

## Parameters

### config

[`LocaleConfig`](../interfaces/LocaleConfig.md)

### code

`string`

### value

`number`

### currency

`string`

### opts?

`NumberFormatOptions`

## Returns

`string`
