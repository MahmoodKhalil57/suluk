# Functions

## locale

### `defineLocales`
Define an app's locale set. Pass-through (preserves literal types under `<const>`) so callers get a precise
`LocaleCode<typeof config>` union AND the config to feed the loader/resolver/formatter.
```ts
defineLocales<C>(config: C): C
```
**Parameters:**
- `config: C`
**Returns:** `C`

### `localeCodes`
All declared codes, in order.
```ts
localeCodes(config: LocaleConfig): string[]
```
**Parameters:**
- `config: LocaleConfig`
**Returns:** `string[]`

### `isSupportedLocale`
Is `code` a declared locale?
```ts
isSupportedLocale(config: LocaleConfig, code: string | null | undefined): boolean
```
**Parameters:**
- `config: LocaleConfig`
- `code: string | null | undefined`
**Returns:** `boolean`

### `dirOf`
The writing direction for a locale (default "ltr" — an unknown code is treated as ltr).
```ts
dirOf(config: LocaleConfig, code: string): Direction
```
**Parameters:**
- `config: LocaleConfig`
- `code: string`
**Returns:** `Direction`

### `resolveLocale`
Resolve a candidate (cookie value, query param, negotiated pick) to a supported locale, else the default.
```ts
resolveLocale(config: LocaleConfig, candidate: string | null | undefined): string
```
**Parameters:**
- `config: LocaleConfig`
- `candidate: string | null | undefined`
**Returns:** `string`

### `readCookie`
Read one cookie's value out of a Cookie header string (Workers-safe — no `next/headers`).
```ts
readCookie(cookieHeader: string | null | undefined, name: string): string | undefined
```
**Parameters:**
- `cookieHeader: string | null | undefined`
- `name: string`
**Returns:** `string | undefined`

### `localeFromCookie`
Resolve the locale from a `locale` cookie in a Cookie header (Workers-safe).
```ts
localeFromCookie(config: LocaleConfig, cookieHeader: string | null | undefined, cookieName: string): string
```
**Parameters:**
- `config: LocaleConfig`
- `cookieHeader: string | null | undefined`
- `cookieName: string` — default: `"locale"`
**Returns:** `string`

### `negotiateLocale`
Negotiate the best supported locale from an `Accept-Language` header (q-weighted; exact then primary-subtag match).
Returns the default when nothing matches. Used as a fallback when no `locale` cookie is set.
```ts
negotiateLocale(config: LocaleConfig, acceptLanguage: string | null | undefined): string
```
**Parameters:**
- `config: LocaleConfig`
- `acceptLanguage: string | null | undefined`
**Returns:** `string`

### `localeFromRequest`
Resolve the locale for a standard Request: the `locale` cookie wins; else negotiate from `Accept-Language`.
Workers-safe (only reads `request.headers`). This is the server cookie→locale resolution the app calls per request.
```ts
localeFromRequest(config: LocaleConfig, request: Request, cookieName: string): string
```
**Parameters:**
- `config: LocaleConfig`
- `request: Request`
- `cookieName: string` — default: `"locale"`
**Returns:** `string`

## messages

### `t`
Interpolate `{token}` params into a message; an unknown key falls back to the key itself.
Ported verbatim from saastarter i18n.ts:195-207.
```ts
t(messages: Catalog, key: string, params?: Record<string, string | number>): string
```
**Parameters:**
- `messages: Catalog`
- `key: string`
- `params: Record<string, string | number>` (optional)
**Returns:** `string`

### `translator`
Bind a catalog so callers write `tt("key", { name })` instead of threading the catalog every call.
```ts
translator(messages: Catalog): (key: string, params?: Record<string, string | number>) => string
```
**Parameters:**
- `messages: Catalog`
**Returns:** `(key: string, params?: Record<string, string | number>) => string`

### `loadMessages`
Load a namespace's catalog for a locale, falling back to the DEFAULT locale's chunk when the locale is missing
(saastarter's `nsLoaders[locale] ?? nsLoaders.en`, i18n.ts:189 — generalized to any default). Only the resolved
chunk is imported (tree-shakeable). Throws only if NEITHER the locale nor the default has a loader (a config bug).
```ts
loadMessages<M>(loaders: NamespaceLoaders<M>, locale: string, defaultLocale: string): Promise<M>
```
**Parameters:**
- `loaders: NamespaceLoaders<M>`
- `locale: string`
- `defaultLocale: string`
**Returns:** `Promise<M>`

### `gradeCompleteness`
Grade a locale catalog against the default catalog — the runtime, harden-style completeness gauge that complements
the compile-time key-parity types. Surfaces missing/extra keys + a 0–1 grade so a locale's coverage is auditable.
```ts
gradeCompleteness(defaultCatalog: Catalog, localeCatalog: Catalog, locale: string): CompletenessGrade
```
**Parameters:**
- `defaultCatalog: Catalog`
- `localeCatalog: Catalog`
- `locale: string`
**Returns:** `CompletenessGrade`

## format

### `formatNumber`
Format a number for a locale — honors its numberingSystem (e.g. "arab" → ٠١٢٣).
```ts
formatNumber(config: LocaleConfig, code: string, value: number, opts?: NumberFormatOptions): string
```
**Parameters:**
- `config: LocaleConfig`
- `code: string`
- `value: number`
- `opts: NumberFormatOptions` (optional)
**Returns:** `string`

### `formatCurrency`
Format a MONEY amount. `value` is the major-unit number (e.g. dollars); for integer cents from @suluk/stripe,
pass `cents / 100`. Honors the locale's numbering system + currency conventions.
```ts
formatCurrency(config: LocaleConfig, code: string, value: number, currency: string, opts?: NumberFormatOptions): string
```
**Parameters:**
- `config: LocaleConfig`
- `code: string`
- `value: number`
- `currency: string`
- `opts: NumberFormatOptions` (optional)
**Returns:** `string`

### `formatDate`
Format a date/time for a locale (honors the numbering system for numeric date parts).
```ts
formatDate(config: LocaleConfig, code: string, value: string | number | Date, opts?: DateTimeFormatOptions): string
```
**Parameters:**
- `config: LocaleConfig`
- `code: string`
- `value: string | number | Date`
- `opts: DateTimeFormatOptions` (optional)
**Returns:** `string`
