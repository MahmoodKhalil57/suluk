[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [Registry](../../Registry.md) / [Services](../Services.md) / rate-credit

# Rate credit — credit-backed free-tier limiter (auto-regenerating µ$ allowance)

A per-principal token bucket denominated in µ$ (the same unit as a route's COGS in `cost`) that sits alongside the fixed-window `rate-limit`: each free-tier request debits a small fixed cost, and the request is refused with a 429 (RFC-9457) when the bucket is empty — so the most free COGS a caller can ever cost the platform is hard-bounded.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/rate-credit
# or:  npx shadcn@latest add MahmoodKhalil57/suluk/rate-credit
# pin to a ref:  MahmoodKhalil57/suluk/rate-credit#main
```

`registryDependencies` (here, `app`) are pulled in automatically, and the npm `dependencies` are installed. The one file lands in your app; the RFC-9457 envelope comes down as an npm package.

## What you get

One file drops into your app — yours to edit:

- **`src/services/rate-credit.ts`** (from `rate-credit.service.ts`) — the credit-backed free-tier limiter as a Hono middleware. Unlike the other registry items this is a **cross-cutting concern, not a routed Effect service** and it owns **no schema / no provision fragment** — its state is a single KV binding.
  - **`mountRateCredit(app, opts?)`** — the global-middleware mount the generated entry calls. Applies `rateCredit()` to `/api/*`. Register it AFTER identity resolves (so the principal is on the context), alongside the fixed-window `rate-limit`.
  - **`rateCredit(opts?)`** — the middleware itself. Per request (except the skip list) it resolves the principal key, debits the fixed µ$ cost from that bucket, and returns a `429` (RFC-9457, `Retry-After` header) when the bucket can't cover it — otherwise passes. `RateCreditOptions`: `costMicroUsd`, `dials`, `skip` (default `["/api/health", "/api/webhooks"]`), and an injectable `now` clock for tests.
  - **`debitRateCredit(kv, key, costMicroUsd, nowMs, dials?)`** — the pure bucket step: lazily regenerate on read (no cron; anchored on an epoch-ms timestamp), then try to debit. Returns `RateCreditResult` `{ allowed, remaining, retryAfterMs }`.
  - **`rateCreditKey(principal)`** — the KV key for a principal: `rc:u:<userId>` for a signed-in user, else `rc:ip:<ip>` from `cf-connecting-ip`.
  - **`keyRateDials(sharePct)`** — a per-API-key SUB-bucket's `BucketDials`: a clamped `[1,100]` % slice of the account allowance (burst AND refill scaled together, so a capped key gets a proportional slice of the SAME µ$ allowance, not a separate budget).
  - **Owned dials** (operator-set constants): `RATE_CREDIT_CAP_MICROUSD` ($0.05 burst), `RATE_CREDIT_REGEN_PER_HOUR_MICROUSD` ($0.01/hour refill), `RATE_CREDIT_REQUEST_COST_MICROUSD` ($0.001/request). Types `RateCreditKv`, `BucketDials`, `RateCreditResult`, `RateCreditBindings`, `RateCreditOptions` are exported alongside.

### State: one KV binding, no owned table

The buckets live in a single KV namespace, `env.RATE_CREDIT_KV` (`RateCreditBindings`), provisioned by `@suluk/provision` separately — it is a **binding, not an owned D1 table**, which is why this module ships no schema and no provision fragment. Regen is lazy on read (an idle bucket refills to full, and the KV entry is given a matching TTL so an absent key reads as a full bucket). KV is eventually-consistent, so concurrent requests can over-spend a little — fine for an abuse cap, since this is NOT the money ledger. It is **FAIL-OPEN**: on any KV error, an unbound namespace (local dev — logs once, then no-ops), or a non-regenerating (÷0) config, a legit user is never 429'd.

## Dependencies

**npm (`dependencies`):**

- [`@suluk/core`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/tooling/ts/packages/core) — `toProblemDetails`, the shared RFC-9457 envelope (see below)
- `hono` — the middleware / `Context` types

**Registry (`registryDependencies`):** `MahmoodKhalil57/suluk/app` — the base Hono app and its `Bindings` type (into which `RATE_CREDIT_KV` is structurally merged).

## Own the wiring, npm the logic

This is the HYBRID pattern (ADR [C050](https://github.com/MahmoodKhalil57/suluk/blob/main/registry/doc/architecture/decisions/C050-registry-distributed-framework.md)/[C052](https://github.com/MahmoodKhalil57/suluk/blob/main/registry/doc/architecture/decisions/C052-npm-vs-registry-boundary.md)): you **own** the policy, and **npm** the shared correctness surface.

- **You own** the µ$ bucket math — the operator's dials, the free-tier gate shape, the regen/debit step, and the mount. Per C052 this is app-owned POLICY (your dials, your gate), so it is **ported here as code you edit**, not shipped as a `@suluk/*` package. Change the cap/refill, retarget the skip list, or swap the principal key freely.
- **`@suluk/core` owns** the 429 error contract: the middleware builds its rejection body with `toProblemDetails({ tag: "RateLimitedError", … })`, so the RFC-9457 Problem Details envelope (status `429`, the canonical `title`, the `application/problem+json` shape) is the ONE thing that flows from npm — the same envelope every other Suluk error path emits.

A fix to the error-envelope contract reaches you as a version bump; your free-tier policy stays yours.
