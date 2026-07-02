---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-email
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Configuration

**EmailConfig** (5 options — see references/config.md)

## Quick Reference

**email.service:** `emailCfgFromEnv` (Build the config from env — console provider unless production AND a key AND a from-address are all present), `EmailCfgLive`, `EmailCfg`, `Email`, `EmailEnv` (The env vars the provider binding needs (declare these in your `wrangler`/`), `EmailLive`
**email.routes:** `emailRoutes`
**email.contract:** `emailOps`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults