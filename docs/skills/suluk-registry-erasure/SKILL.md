---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-erasure
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Configuration

**MountErasureOptions** (1 options — see references/config.md)

## Quick Reference

**erasure.service:** `sulukCascade` (The default cascade is now EMPTY — the steps are DISTRIBUTED: each installed data module OWNS its own `eraseStep` (over
ITS table) and the generator composes only the installed ones into `extraSteps` (no central table list → a subset never
DELETEs a table it didn't install, and a GDPR build-guard warns if an installed module isn't wired)), `erasureHook` (The Better Auth `user), `ErasureLive` (ErasureLive is a FACTORY — pass the COMPOSED `extraSteps` (the generator wires them from each installed data module's
 `eraseStep`)), `Erasure`, `ErasureUser` (The minimal user shape the cascade needs (Better Auth passes the full user; we only read the id)), `ExtraSteps` (A factory that, given the request `db`, builds the per-module erase-steps — COMPOSED by the generator from each installed
 data module's `eraseStep` capability (platform), `step`
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
- When configuring options → read `references/config.md` for all settings and defaults