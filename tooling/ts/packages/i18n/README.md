<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

# @suluk/i18n

**The locale primitive every content app needs — a typed locale/direction model, a Workers-safe message loader, and `Intl` formatting, framework-agnostic and dependency-free.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/i18n
```

## What it does

Consolidates the fragmented i18n surface into one package. It owns the **mechanism**; your app authors the **content** (the per-locale message catalogs).

- **Typed locale + direction model** — `defineLocales` declares an app's locale set once and derives a precise `LocaleCode` union; `dirOf` resolves writing direction (RTL) from the config, not ad-hoc markup.
- **Workers-safe resolution** — cookie → locale (`localeFromCookie`) and full per-request negotiation (`localeFromRequest`, q-weighted `Accept-Language`), reading only a cookie string or a standard `Request` — never `next/headers`.
- **Message loader with fallback** — `t()` does `{token}` interpolation; `loadMessages()` imports only the active locale's chunk (tree-shakeable) and falls back to the default locale when a locale is missing.
- **Completeness gauges** — a compile-time `KeyParity<>` type (a dropped/typo'd key is a type error) plus a runtime `gradeCompleteness()` that surfaces missing/extra keys and a 0–1 grade.
- **Locale-aware `Intl` formatting** — `formatNumber`/`formatCurrency`/`formatDate` honor each locale's declared `numberingSystem`, so an `"arab"` locale renders Eastern-Arabic numerals (٠١٢٣) out of the box. Pure `Intl`, no deps.

## When to reach for it

Reach for `@suluk/i18n` in **any content app** that needs more than one locale — a marketing site, a storefront, a dashboard — and wants locale resolution + number/currency/date formatting that works the same in Node, Bun, and a Cloudflare Worker.

It owns the **machinery**, not the strings. The package never ships your translations: you author the catalogs (a flat `key → string` record per locale) and hand them in. If you only need static UI-chrome strings, the in-app `DICT` + `t()` pattern is enough; reach for `loadMessages`/`gradeCompleteness` once catalogs grow per-namespace and per-locale chunking and coverage-auditing start to matter.

## Usage

### Declare the locale set

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

### Resolve the request locale (Workers-safe)

```ts
import { localeFromRequest, localeFromCookie, dirOf } from "@suluk/i18n";

// per request: the `locale` cookie wins, else negotiate Accept-Language, else the default
const locale = localeFromRequest(LOCALES, request);   // a standard Request
const dir = dirOf(LOCALES, locale);                   // "ltr" | "rtl" → stamp <html lang dir>

// or from a Cookie header string directly
const fromCookie = localeFromCookie(LOCALES, request.headers.get("cookie"));
```

### Translate messages

```ts
import { t, translator, type Catalog } from "@suluk/i18n";

const en: Catalog = { greeting: "Hello {name}", bye: "Bye" };

t(en, "greeting", { name: "Sam" }); // "Hello Sam"   ({token} interpolation)
t(en, "missing");                   // "missing"     (unknown key → the key itself)

// bind a catalog so callers don't thread it every call
const tt = translator(en);
tt("greeting", { name: "Lina" });   // "Hello Lina"
```

### Load catalogs per locale (tree-shakeable, with fallback)

```ts
import { loadMessages, type NamespaceLoaders } from "@suluk/i18n";

// each arrow is a discrete chunk boundary, so a bundler tree-shakes inactive locales
const nav: NamespaceLoaders<Catalog> = {
  en: () => import("./catalogs/nav.en"), // a module whose `default` is the catalog
  ar: () => import("./catalogs/nav.ar"),
};

const messages = await loadMessages(nav, locale, LOCALES.default);
// "es" requested but no "es" loader → falls back to the default ("en") chunk
```

### Audit coverage

```ts
import { gradeCompleteness, type KeyParity } from "@suluk/i18n";

// compile-time: a non-default catalog must declare EXACTLY the default's keys
const ar = { greeting: "مرحبا {name}", bye: "وداعا" } satisfies KeyParity<typeof en>;

// runtime: missing/extra keys + a 0–1 grade
const g = gradeCompleteness(en, { greeting: "Hola {name}", stale: "x" }, "es");
// → { total: 2, translated: 1, missing: ["bye"], extra: ["stale"], grade: 0.5 }
```

### Format numbers, money, and dates

```ts
import { formatNumber, formatCurrency, formatDate } from "@suluk/i18n";

formatNumber(LOCALES, "ar", 123);              // "١٢٣"  (honors numberingSystem: "arab")
formatCurrency(LOCALES, "en", 19.99, "USD");   // "$19.99"   (value is the MAJOR unit; pass cents / 100)
formatDate(LOCALES, "ar", new Date(), { dateStyle: "medium" }); // Arabic numerals in date parts
```

### `@suluk/i18n/astro` — middleware glue

The `./astro` subpath resolves the request locale and stamps `locale` + `dir` onto `context.locals`, so an Astro layout can set `<html lang dir>` server-side. Duck-typed — no `astro` dependency required.

```ts
// src/middleware.ts
import { i18nMiddleware } from "@suluk/i18n/astro";
import { LOCALES } from "./i18n";

export const onRequest = i18nMiddleware(LOCALES); // → context.locals.locale + context.locals.dir
```

## API

| Export | Does |
| --- | --- |
| `defineLocales(config)` | declare the locale set (pass-through, preserves literal types for `LocaleCode`) |
| `LocaleCode<C>` | the literal union of a config's locale codes |
| `localeCodes` / `isSupportedLocale` | list declared codes / test membership |
| `dirOf` / `resolveLocale` | writing direction for a locale / coerce a candidate to a supported locale |
| `readCookie` / `localeFromCookie` | parse a Cookie header / resolve the `locale` cookie (Workers-safe) |
| `negotiateLocale` / `localeFromRequest` | q-weighted `Accept-Language` match / full per-request resolution (cookie → negotiate) |
| `t` / `translator` | `{token}` interpolation / bind a catalog into a `tt(key, params)` function |
| `loadMessages` / `NamespaceLoaders` | import the active locale's chunk with default-locale fallback |
| `gradeCompleteness` / `KeyParity<D>` | runtime coverage grade / compile-time key-parity type |
| `formatNumber` / `formatCurrency` / `formatDate` | locale-aware `Intl` formatting honoring `numberingSystem` |
| `i18nMiddleware` *(`/astro`)* | Astro middleware stamping `locals.locale` + `locals.dir` |

## Boundary

This package owns the **mechanism** and stops at the **content**. It never ships translations — you author the catalogs (the bytes) and inject them; every function is pure and takes the `LocaleConfig` (and, for loaders, your import thunks) as an argument, so the same code runs in dev, Bun, and a Worker. Resolution reads only a cookie string or a standard `Request` — framework routing/prerendering and the locale-switch UI stay app-side (the `/astro` glue is intentionally thin: it resolves + stamps, nothing more). Per the Suluk L3 line — render/generate, never host.

## License

Apache-2.0.
