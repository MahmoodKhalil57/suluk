---
description: "The platform generator (C051): write one `definePlatform` manifest → it plans the shadcn-registry adds, generates the wired Hono entry, and merges each module's provision fragment into a single provision.config. The manifest compiles to a shadcn-add list + a C047 provision.config; the generator runs the adds + `@suluk/provision`. Turns the Suluk backend registry into a one-command platform. CANDIDATE tooling."
name: suluk-platform
---

# @suluk/platform

The platform generator (C051): write one `definePlatform` manifest → it plans the shadcn-registry adds, generates the wired Hono entry, and merges each module's provision fragment into a single provision.config. The manifest compiles to a shadcn-add list + a C047 provision.config; the generator runs the adds + `@suluk/provision`. Turns the Suluk backend registry into a one-command platform. CANDIDATE tooling.

## Configuration

**GenerateOptions** (4 options — see references/config.md)

## Quick Reference

70 exports (26 functions, 20 types, 24 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)