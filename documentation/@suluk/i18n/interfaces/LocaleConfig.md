[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / LocaleConfig

# Interface: LocaleConfig

Defined in: [locale.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/i18n/src/locale.ts#L23)

`@suluk/i18n` — the locale primitive every content app needs. Consolidates the fragmented i18n surface into one
package: a typed locale/direction model (defineLocales/dirOf), a Workers-safe message loader with default-locale
fallback + {token} interpolation (t), compile-time key-parity + a runtime completeness grade, Intl number/
currency/date formatting (incl. Eastern-Arabic numerals), and framework-agnostic cookie→locale resolution. The
catalog CONTENT is app-authored; this owns the MECHANISM. Astro middleware glue is the `@suluk/i18n/astro` subpath.
CANDIDATE tooling.

## Properties

### default

> `readonly` **default**: `string`

Defined in: [locale.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/i18n/src/locale.ts#L26)

the fallback locale — every namespace must ship this one (the `?? en` of saastarter i18n.ts:189).

***

### locales

> `readonly` **locales**: readonly [`LocaleDef`](LocaleDef.md)[]

Defined in: [locale.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/i18n/src/locale.ts#L24)
