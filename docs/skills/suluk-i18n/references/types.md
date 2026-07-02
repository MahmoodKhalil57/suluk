# Types & Enums

## locale

### `Direction`
The locale + direction model (saastarter-parity Phase 1). saastarter hardcodes its locale set
(`SupportedLocale = "en" | "ar" | "es"`, locale.ts:3) and reads the cookie via `next/headers` (locale.ts:1,9) —
neither is reusable. This GENERICIZES the set into a config (the app declares its own locales) and makes
resolution FRAMEWORK-AGNOSTIC + Workers-safe (a cookie string / a standard Request, never `next/headers`).
Direction (RTL) — which saastarter sets ad-hoc in markup — is modeled here as `dirOf`.
```ts
"ltr" | "rtl"
```

### `LocaleDef`
One locale in an app's set.
**Properties:**
- `code: string` — BCP-47 tag, e.g. "en", "ar", "es" (or a region: "ar-EG").
- `label: string` (optional) — human label in its OWN language (for a picker), e.g. "العربية".
- `dir: Direction` (optional) — writing direction (default "ltr"; set "rtl" for ar/he/fa/ur).
- `numberingSystem: string` (optional) — Intl numbering system, e.g. "arab" for Eastern-Arabic numerals (٠١٢٣). Default "latn".

### `LocaleCode`
The literal union of an app's locale codes (use with `as const` input): `LocaleCode<typeof MY_LOCALES>`.
```ts
C["locales"][number]["code"]
```

## messages

### `Catalog`
A flat catalog: message key → string.
```ts
Record<string, string>
```

### `NamespaceLoaders`
Per-locale loaders for ONE namespace: locale code → a dynamic-import thunk returning `{ default: catalog }`.
```ts
Record<string, () => Promise<{ default: M }>>
```

### `CompletenessGrade`
**Properties:**
- `locale: string`
- `total: number` — keys in the default catalog (the target).
- `translated: number` — keys present AND non-empty in this locale.
- `missing: string[]` — keys in the default catalog absent or empty here.
- `extra: string[]` — keys present here but not in the default (stale / typo'd).
- `grade: number` — translated / total, in [0, 1] (1 when the default is empty).

### `KeyParity`
Compile-time key-parity helper: a locale catalog typed `KeyParity<typeof enCatalog>` must declare EXACTLY the
default's keys (no missing, no extra). Use it on each non-default catalog so a dropped/typo'd key is a type error.
```ts
{ [K in keyof Default]: string }
```
