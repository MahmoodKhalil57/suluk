---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-contract
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Configuration

**MountContractOptions** (1 options — see references/config.md)

## Quick Reference

**contract.contract:** `apiDocument` (Build the v4 OpenAPI document, projected for a principal (the WHO axis)), `apiDocumentWithAuth` (The FULL v4 document INCLUDING Better Auth's own surface (sign-in/up/out, get-session, social sign-in, …) — so
BETTER-AUTH CLIENTS can discover + call the auth API from the same `/api/openapi), `matchRoute` (TIER-1 route match — the exact declared op a request resolves to: the longest static-path-prefix + same-method match
among the CONTRACT (a `GET /api/credits/balance/x` → the `getCredits` op at `/api/credits`)), `scopeForRequest`, `OpName` (The op-name type — the by-name handle each derivation keys on (C009)), `CONTRACT` (THE base operation surface = the system ops + every installed module's composed fragment), `SCOPE_BY_OP` (op-name → its single required scope (the `x-suluk-access` facet)), `PUBLIC_OPS` (The set of PUBLIC op-names — those that declare NO scope (health, the pricing catalogs, the signature-verified Stripe
webhook)), `enforceApiKeyScope` (SCOPE-GATE for KEYED callers (an `x-api-key` / MCP caller — a `keyId` is on the context)), `validateRequest` (CONTRACT-DERIVED request-body validation)
**contract.routes:** `mountContract`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults