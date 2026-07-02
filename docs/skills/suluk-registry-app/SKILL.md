---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-app
---

# suluk-tooling

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Quick Reference

**app:** `trustedOrigins` (The app-owned trusted-origin allowlist (from `TRUSTED_ORIGINS`)), `createApp` (Create the base app), `DbLive` (Build the `Db` layer for one request from the Worker bindings), `Db` (The database as an Effect service — every feature service depends on it; the app provides it per-request from the
 D1 binding, so services never reach for a global), `Bindings`, `App`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`