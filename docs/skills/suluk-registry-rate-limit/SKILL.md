---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-rate-limit
---

# suluk-tooling

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Configuration

**RateLimitOptions** — The wiring knobs for this module. `operationOf` + `rateLimitOf` are the two facet resolvers @suluk/hono needs
(resolve the contract operation for a request, then look up its declared budget) — pass the ones your emitted
contract gives you. Everything else is optional and defaulted here. (5 options — see references/config.md)

## Quick Reference

**rate-limit.service:** `rateLimit` (Build the principal-aware rate-limit middleware), `mountRateLimit` (Apply principal-aware rate limiting to EVERY request — the global-middleware mount the generated entry calls as
`mountRateLimit(app)` (a cross-cutting concern, not a routed resource))

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When configuring options → read `references/config.md` for all settings and defaults