---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-credits
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Quick Reference

**credits.routes:** `creditsRoutes`
**credits.service:** `Credits`, `CreditsLive`
**credits.schema:** `creditTransaction` (The credit-ledger schema (Suluk registry: `credits`) — re-exported from `@suluk/credits`, which OWNS the table
definitions (the append-only `credit_transaction` + the `credit_amount`/`credit_key` sidecars))
**credits.provision:** `creditsProvision`
**credits.contract:** `creditsOps`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When using exported constants → read `references/variables.md`