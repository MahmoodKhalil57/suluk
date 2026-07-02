---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-keys
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Quick Reference

**keys.routes:** `keysRoutes`
**keys.service:** `DisableKeys` (Disable keys in your apikey table (Better Auth's apikey plugin) — `revokeKeyTree` calls it), `CreateKey` (MINT a real api key — provided from your auth layer (Better Auth's `auth), `Keys`, `RequestedCaps` (The caps a caller REQUESTS for a new child (clamped to the parent's before minting)), `KeysLive`
**keys.schema:** `keyLineage` (The key-lineage schema (Suluk registry: `keys`) — re-exported from `@suluk/keys`, which owns the delegation-tree table
(the materialized path that makes the pooled-headroom cap + cascade revoke work))
**keys.provision:** `keysProvision`
**keys.contract:** `keysOps`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`