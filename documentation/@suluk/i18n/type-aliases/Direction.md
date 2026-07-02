[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / Direction

# Type Alias: Direction

> **Direction** = `"ltr"` \| `"rtl"`

Defined in: [locale.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/i18n/src/locale.ts#L9)

The locale + direction model (saastarter-parity Phase 1). saastarter hardcodes its locale set
(`SupportedLocale = "en" | "ar" | "es"`, locale.ts:3) and reads the cookie via `next/headers` (locale.ts:1,9) —
neither is reusable. This GENERICIZES the set into a config (the app declares its own locales) and makes
resolution FRAMEWORK-AGNOSTIC + Workers-safe (a cookie string / a standard Request, never `next/headers`).
Direction (RTL) — which saastarter sets ad-hoc in markup — is modeled here as `dirOf`.
