[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / localeFromRequest

# Function: localeFromRequest()

> **localeFromRequest**(`config`, `request`, `cookieName?`): `string`

Defined in: [locale.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/i18n/src/locale.ts#L109)

Resolve the locale for a standard Request: the `locale` cookie wins; else negotiate from `Accept-Language`.
Workers-safe (only reads `request.headers`). This is the server cookie→locale resolution the app calls per request.

## Parameters

### config

[`LocaleConfig`](../interfaces/LocaleConfig.md)

### request

`Request`

### cookieName?

`string` = `"locale"`

## Returns

`string`
