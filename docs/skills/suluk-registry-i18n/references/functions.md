# Functions

## i18n.service

### `localeMiddleware`
Build the locale-negotiation middleware for a given locale set. Precedence: a `?lang=` query override wins (if it names
a supported locale), then the `locale` cookie, then a q-weighted `Accept-Language` match — falling back to the config
default. Sets `c.set("locale", code)` and `c.set("dir", "ltr"|"rtl")`. The matching itself lives in `@suluk/i18n`.
```ts
localeMiddleware(config: LocaleConfig): MiddlewareHandler
```
**Parameters:**
- `config: LocaleConfig` — default: `LOCALES`
**Returns:** `MiddlewareHandler`

### `mountI18n`
Apply locale/direction negotiation to EVERY request — the global-middleware mount the generated entry calls as
`mountI18n(app)` (a cross-cutting concern). After it runs, every downstream handler can read `c.get("locale")` +
`c.get("dir")`. Edit LOCALES to declare your locale set.
```ts
mountI18n<T>(app: T, config: LocaleConfig): T
```
**Parameters:**
- `app: T`
- `config: LocaleConfig` — default: `LOCALES`
**Returns:** `T`
