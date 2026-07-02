---
description: "The locale primitive every content app needs: a typed locale/direction model (defineLocales), a Workers-safe message loader with default-locale fallback + {token} interpolation, compile-time key-parity + a runtime completeness grade, Intl number/currency/date formatting (incl. Eastern-Arabic numerals), framework-agnostic cookie→locale resolution, and an ./astro middleware glue. The catalog CONTENT stays app-authored; this owns the MECHANISM. CANDIDATE tooling."
name: suluk-i18n
---

# @suluk/i18n

The locale primitive every content app needs: a typed locale/direction model (defineLocales), a Workers-safe message loader with default-locale fallback + {token} interpolation, compile-time key-parity + a runtime completeness grade, Intl number/currency/date formatting (incl. Eastern-Arabic numerals), framework-agnostic cookie→locale resolution, and an ./astro middleware glue. The catalog CONTENT stays app-authored; this owns the MECHANISM. CANDIDATE tooling.

## Quick Start

```ts
import { defineLocales, type LocaleCode } from "@suluk/i18n";

export const LOCALES = defineLocales({
  default: "en",
  locales: [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "ar", label: "العربية", dir: "rtl", numberingSystem: "arab" }, // → ٠١٢٣
  ],
});

// the literal union is derived from the config — no second source of truth
type Locale = LocaleCode<typeof LOCALES>; // "en" | "es" | "ar"
```

## Configuration

**LocaleConfig** — `@suluk/i18n` — the locale primitive every content app needs. Consolidates the fragmented i18n surface into one
package: a typed locale/direction model (defineLocales/dirOf), a Workers-safe message loader with default-locale
fallback + {token} interpolation (t), compile-time key-parity + a runtime completeness grade, Intl number/
currency/date formatting (incl. Eastern-Arabic numerals), and framework-agnostic cookie→locale resolution. The
catalog CONTENT is app-authored; this owns the MECHANISM. Astro middleware glue is the `@suluk/i18n/astro` subpath.
CANDIDATE tooling. (2 options — see references/config.md)

## Quick Reference

**locale:** `defineLocales` (Define an app's locale set), `localeCodes` (All declared codes, in order), `isSupportedLocale` (Is `code` a declared locale), `dirOf` (The writing direction for a locale (default "ltr" — an unknown code is treated as ltr)), `resolveLocale` (Resolve a candidate (cookie value, query param, negotiated pick) to a supported locale, else the default), `readCookie` (Read one cookie's value out of a Cookie header string (Workers-safe — no `next/headers`)), `localeFromCookie` (Resolve the locale from a `locale` cookie in a Cookie header (Workers-safe)), `negotiateLocale` (Negotiate the best supported locale from an `Accept-Language` header (q-weighted; exact then primary-subtag match)), `localeFromRequest` (Resolve the locale for a standard Request: the `locale` cookie wins; else negotiate from `Accept-Language`), `Direction` (The locale + direction model (saastarter-parity Phase 1)), `LocaleDef` (One locale in an app's set), `LocaleCode` (The literal union of an app's locale codes (use with `as const` input): `LocaleCode<typeof MY_LOCALES>`)
**messages:** `t` (Interpolate `{token}` params into a message; an unknown key falls back to the key itself), `translator` (Bind a catalog so callers write `tt("key", { name })` instead of threading the catalog every call), `loadMessages` (Load a namespace's catalog for a locale, falling back to the DEFAULT locale's chunk when the locale is missing
(saastarter's `nsLoaders[locale] ), `gradeCompleteness` (Grade a locale catalog against the default catalog — the runtime, harden-style completeness gauge that complements
the compile-time key-parity types), `Catalog` (A flat catalog: message key → string), `NamespaceLoaders` (Per-locale loaders for ONE namespace: locale code → a dynamic-import thunk returning `{ default: catalog }`), `CompletenessGrade`, `KeyParity` (Compile-time key-parity helper: a locale catalog typed `KeyParity<typeof enCatalog>` must declare EXACTLY the
default's keys (no missing, no extra))
**format:** `formatNumber` (Format a number for a locale — honors its numberingSystem (e), `formatCurrency` (Format a MONEY amount), `formatDate` (Format a date/time for a locale (honors the numbering system for numeric date parts))

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)