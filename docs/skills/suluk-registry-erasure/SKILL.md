---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-erasure
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Quick Reference

**erasure.service:** `sulukCascade` (The default hard-DELETE cascade over the core Suluk tables — EDIT to match the modules you installed + your posture), `erasureHook` (The Better Auth `user), `Erasure`, `ErasureUser` (The minimal user shape the cascade needs (Better Auth passes the full user; we only read the id)), `ErasureLive`, `step`
**erasure.routes:** `erasureRoutes`
**erasure.schema:** `erasureReceipt`
**erasure.provision:** `erasureProvision`
**erasure.contract:** `erasureOps`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`