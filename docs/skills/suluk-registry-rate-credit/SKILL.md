---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-rate-credit
---

# suluk-tooling

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Configuration

**RateCreditOptions** — Wiring knobs. All optional and defaulted — the free-tier gate works out of the box once `RATE_CREDIT_KV` is bound. (4 options — see references/config.md)

## Quick Reference

**rate-credit.service:** `debitRateCredit` (Lazily regenerate the bucket, then try to debit `costMicroUsd`), `rateCredit` (The credit-backed free-tier limiter as a Hono middleware), `mountRateCredit` (Apply the credit-backed free-tier limiter to the `/api/*` surface — the global-middleware mount the generated entry
calls as `mountRateCredit(app)` (a cross-cutting concern, not a routed resource)), `keyRateDials` (A per-API-key sub-bucket's dials = its SHARE (%) of the account allowance, with burst AND sustained scaled together —
 so a capped key gets a proportional slice of the SAME shared µ$ cost allowance (not a separate budget)), `rateCreditKey` (The KV key for a principal (signed-in user) or an IP), `RateCreditKv` (A minimal local shape of a Cloudflare KV namespace — just the two members this module touches), `BucketDials` (A token bucket's two dials: its burst ceiling + its sustained refill rate), `RateCreditResult`, `RateCreditBindings` (The bindings this module reads: one KV namespace for the buckets), `RATE_CREDIT_CAP_MICROUSD`, `RATE_CREDIT_REGEN_PER_HOUR_MICROUSD`, `RATE_CREDIT_REQUEST_COST_MICROUSD` (The fixed µ$ cost a single free-tier request debits (a whole free bucket ≈ 50 requests of burst, ~10/hour sustained))

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults