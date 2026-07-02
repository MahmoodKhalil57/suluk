# Types & Enums

## chain

### `ChainNode`
One node of a caller's chain — itself or an ancestor — with its OWN (pre-chain) grant + caps + its materialized path.
**Properties:**
- `keyId: string`
- `path: string` — the node's own materialized path (a prefix of the caller's) — used to sum its subtree spend.
- `scopes: string[]` — the node's OWN granted tool scopes (an unrestricted account-root never appears as a node).
- `ownCreditLimit: number | null`
- `ownRateSharePct: number | null`
- `ownExpiresAt: number | null` — epoch ms — the node's own expiry; null = never.
- `disabled: boolean` (optional) — an ancestor soft-disabled (enabled=false) — drives the auth-time revocation cascade.

### `EffectiveCaps`
`@suluk/keys` — the delegation-chain ALGEBRA for hierarchical API keys (C046, extracted from a real app).

The app builds a `ChainNode[]` (a caller + its ancestors) and per-path `SpendRow[]` from its OWN store — the DB query
is the seam (a Drizzle reference adapter is a follow-on, deferred per C046) — then calls these PURE functions for the
money/abuse-correctness logic so it can never drift:
  • effectiveCaps   — scope ∩, credit-cap/rate-share/expiry min up the chain (a child can't out-scope/out-spend a parent)
  • pooledHeadroom  — a node's cap bounds its WHOLE subtree's total spend (the abuse-proof property)
  • expired/disabledAncestor — the read-time revocation/expiry cascade
  • clampChildGrant — clamp a minted child to the parent's effective grant
plus the materialized-path utilities and the scope/metadata model.
**Properties:**
- `scopes: string[]`
- `creditLimit: number | null`
- `rateLimitSharePct: number | null`
- `expiresAt: number | null`

### `SpendRow`
One row of per-path spend (a positive amount), as the app's subtree query returns it.
**Properties:**
- `path: string`
- `spent: number`

### `Headroom`
`@suluk/keys` — the delegation-chain ALGEBRA for hierarchical API keys (C046, extracted from a real app).

The app builds a `ChainNode[]` (a caller + its ancestors) and per-path `SpendRow[]` from its OWN store — the DB query
is the seam (a Drizzle reference adapter is a follow-on, deferred per C046) — then calls these PURE functions for the
money/abuse-correctness logic so it can never drift:
  • effectiveCaps   — scope ∩, credit-cap/rate-share/expiry min up the chain (a child can't out-scope/out-spend a parent)
  • pooledHeadroom  — a node's cap bounds its WHOLE subtree's total spend (the abuse-proof property)
  • expired/disabledAncestor — the read-time revocation/expiry cascade
  • clampChildGrant — clamp a minted child to the parent's effective grant
plus the materialized-path utilities and the scope/metadata model.
**Properties:**
- `limit: number`
- `spent: number`
- `remaining: number`

## lineage

### `KeysDB`
The injected DB handle (drizzle/d1 in prod; bun:sqlite bridged in tests).
```ts
DrizzleD1Database
```
