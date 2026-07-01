# i18n — locale/direction negotiation middleware

A Hono middleware that resolves each request's locale (`?lang` > cookie > `Accept-Language`) and stashes `locale` + `dir` on the context — wired over `@suluk/i18n`. The q-weighted matcher, the cookie parser, and the config/direction model stay upstream, so a fix flows to you via npm; you own only the app's default locale set and the middleware plumbing.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/i18n
# or:  npx shadcn@latest add MahmoodKhalil57/suluk/i18n
# pin to a ref:  MahmoodKhalil57/suluk/i18n#main
```

`registryDependencies` (here, `app`) are pulled in automatically, and the npm `dependencies` are installed. The file lands in your app; the `@suluk/i18n` logic comes down as an npm package.

## What you get

One file, `src/services/i18n.ts` (from `i18n.service.ts`), delivered into your repo and yours to edit. i18n is a **stateless binding** — no owned schema and no provision fragment (the C052 boundary). It provides:

- **`LOCALES`** — the app's locale set, built with `defineLocales`. Shipped bilingual: English (`ltr`) and Arabic (`rtl`, `numberingSystem: "arab"`), with `default: "en"`. **Edit this** to declare your own locales (code + label + direction); `default` is the fallback every request lands on when nothing negotiates.
- **`localeMiddleware(config = LOCALES)`** — the negotiation `MiddlewareHandler`. Precedence: a `?lang=` query override wins if it names a supported locale, then the `locale` cookie, then a q-weighted `Accept-Language` match — falling back to the config default. It calls `c.set("locale", code)` and `c.set("dir", "ltr" | "rtl")`.
- **`mountI18n(app, config = LOCALES)`** — applies the middleware globally via `app.use("*", …)`. This is the cross-cutting mount the generated entry calls; after it runs, every downstream handler can read `c.get("locale")` + `c.get("dir")`.
- **`I18nVars`** — the type the middleware stashes on the Hono context: `{ locale: string; dir: Direction }`.

## Dependencies

**npm (`dependencies`):**

- [`@suluk/i18n`](../../tooling/ts/packages/i18n) — the locale mechanism (see below)
- `hono` — the middleware + app types

**Registry (`registryDependencies`):** `MahmoodKhalil57/suluk/app` — the base Hono app whose `Bindings` the middleware types against.

## Own the wiring, npm the logic

This is the HYBRID pattern (ADR [C050](../../doc/architecture/decisions/C050-registry-distributed-framework.md)/[C052](../../doc/architecture/decisions/C052-npm-vs-registry-boundary.md)): you **own** the seam, and **npm** the mechanism.

- **You own** the `LOCALES` declaration and the Hono middleware. Edit them freely — add locales, change the override query param or cookie name, adjust the precedence, or mount the middleware on a subtree instead of globally.
- **`@suluk/i18n` owns** the framework-agnostic negotiation logic the middleware calls, so its fixes flow to you via npm instead of forking into your app:
  - `negotiateLocale` — the q-weighted `Accept-Language` match (exact tag, then primary-subtag), Workers-safe; this is the third-precedence fallback.
  - `readCookie` — parses one value out of a `Cookie` header string with no `next/headers` dependency; this reads the `locale` cookie.
  - `resolveLocale` / `isSupportedLocale` — coerce a candidate (query / cookie) to a declared locale, else the default.
  - `dirOf` — resolves writing direction (`ltr` / `rtl`) from the config; this is what stamps `c.set("dir", …)`.
  - `defineLocales` — the typed locale/direction model that `LOCALES` is built with.

A fix in the matcher or cookie parser reaches every consumer as a version bump; a forked negotiation path never happens.
