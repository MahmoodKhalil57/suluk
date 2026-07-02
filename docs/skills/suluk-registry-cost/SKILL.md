---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-cost
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Quick Reference

**cost.routes:** `costRoutes`
**cost.service:** `Cost`, `CostLive`
**cost.schema:** `costEvent` (One recorded cost — the raw, per-request/per-event picture), `costDedup` (The at-least-once dedup ledger — a background event's `dedupeKey` recorded once, so redelivery is a no-op)
**cost.provision:** `costProvision`
**cost.contract:** `costOps`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When using exported constants → read `references/variables.md`