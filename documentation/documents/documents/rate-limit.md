[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / [Registry](../Registry.md) / rate-limit

# Rate limit — principal-aware middleware over @suluk/hono

A principal-aware rate-limit middleware over [`@suluk/hono`](https://github.com/MahmoodKhalil57/suluk/tree/main/tooling/ts/packages/hono)'s
`enforceRateLimit` — a stateless binding whose only owned wiring is the keyer (by authenticated user id,
else client IP) and the store choice; the bucket math, the swappable store, and the 429 envelope stay
upstream.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for OpenAPI
> Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative. This is that candidate's
> ecosystem, distributed as [own-the-code shadcn modules](https://github.com/MahmoodKhalil57/suluk/blob/main/registry/README.md).

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/rate-limit
# or: npx shadcn@latest add MahmoodKhalil57/suluk/rate-limit
# registryDependencies (app) are pulled in automatically
```

## What you get

One file lands in your app — yours to edit:

- **`src/services/rate-limit.ts`** — the owned middleware wiring over `@suluk/hono`'s `enforceRateLimit`:
  - **`principalKeyOf(c, facet)`** — the owned, principal-aware keyer. When a facet keys by `"principal"`
    or `"api-key"`, it keys on the authenticated user id read off the Hono context (`c.get("user")`, the
    Better Auth / [`auth`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/auth) convention), so a signed-in caller gets their own bucket regardless of
    source IP. `"global"` shares one bucket; anonymous / `"ip"` facets fall back to the client IP
    (`x-forwarded-for` → `x-real-ip` → `"unknown"`).
  - **`rateLimit(opts)`** — builds the `MiddlewareHandler`. Thin: it supplies the owned keyer + the store
    and hands everything else to `enforceRateLimit`. Store defaults to `MemoryRateLimitStore` (DEV ONLY).
  - **`mountRateLimit(app, opts?)`** — applies the middleware to **every** request via `app.use("*", …)` —
    the global-middleware mount the generated entry calls (a cross-cutting concern, not a routed resource).
    Register it **after identity resolves** so the principal is on the context.
  - **`RateLimitOptions`** — the wiring knobs: `operationOf` + `rateLimitOf` (the two facet resolvers —
    resolve the contract operation for a request, then look up its declared budget), plus optional `store`,
    `defaultFacet`, and `now`.

**No schema, no provision fragment.** Rate limit is a stateless binding (C052) — it owns no tables. The
durable counter is a swappable **binding**, not owned infra: `MemoryRateLimitStore` is per-instance (it does
**not** coordinate across workers/isolates) so it is dev-only — in prod, pass a KV- or Durable-Object-backed
`RateLimitStore` via `opts.store`, provisioned by `@suluk/deploy`.

### Wiring it up

`mountRateLimit` is **opt-in by default**: the default resolvers decline, so every request passes untouched
until you feed `operationOf` / `rateLimitOf` from your emitted v4 contract. Every operation that declares an
`x-suluk-ratelimit` budget (`SulukRateLimit`: `windowMs`, `maxRequests`, `key`, optional `scope`) is then
metered; the rest pass through. On overflow the request gets a `429` with a `Retry-After` header; a passing
request carries `x-ratelimit-remaining`.

## Dependencies

- **npm** (`dependencies`): `@suluk/hono`, `@suluk/core`, `hono`
- **registry** (`registryDependencies`): [`app`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/app) — the base Hono app + the shared `Bindings` type

## Own the wiring, npm the logic

This module **owns** the wiring: the principal-aware keyer, the store choice, and the global-mount surface —
all yours to edit. What flows from **`@suluk/hono`** on npm is the correctness-critical enforcement: the
`enforceRateLimit` gate (facet resolution → key derivation → `store.consume` → the `429` + `Retry-After`
RFC-9457 envelope), the swappable `RateLimitStore` interface, and the `MemoryRateLimitStore` fixed-window
algorithm. Fix the window math or the 429 shape once upstream and it reaches every consumer via a version
bump — your binding never forks.
