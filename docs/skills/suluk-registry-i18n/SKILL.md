---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-i18n
---

# suluk-tooling

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Quick Reference

**i18n.service:** `localeMiddleware` (Build the locale-negotiation middleware for a given locale set), `mountI18n` (Apply locale/direction negotiation to EVERY request — the global-middleware mount the generated entry calls as
`mountI18n(app)` (a cross-cutting concern)), `I18nVars` (What the middleware stashes on the Hono context (read them with `c), `LOCALES` (The app's locale set — EDIT THIS to declare your locales (code + label + direction))

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`