[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / EffectiveCaps

# Interface: EffectiveCaps

Defined in: [packages/keys/src/chain.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/chain.ts#L28)

`@suluk/keys` — the delegation-chain ALGEBRA for hierarchical API keys (C046, extracted from a real app).

The app builds a `ChainNode[]` (a caller + its ancestors) and per-path `SpendRow[]` from its OWN store — the DB query
is the seam (a Drizzle reference adapter is a follow-on, deferred per C046) — then calls these PURE functions for the
money/abuse-correctness logic so it can never drift:
  • effectiveCaps   — scope ∩, credit-cap/rate-share/expiry min up the chain (a child can't out-scope/out-spend a parent)
  • pooledHeadroom  — a node's cap bounds its WHOLE subtree's total spend (the abuse-proof property)
  • expired/disabledAncestor — the read-time revocation/expiry cascade
  • clampChildGrant — clamp a minted child to the parent's effective grant
plus the materialized-path utilities and the scope/metadata model.

## Properties

### creditLimit

> **creditLimit**: `number` \| `null`

Defined in: [packages/keys/src/chain.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/chain.ts#L30)

***

### expiresAt

> **expiresAt**: `number` \| `null`

Defined in: [packages/keys/src/chain.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/chain.ts#L32)

***

### rateLimitSharePct

> **rateLimitSharePct**: `number` \| `null`

Defined in: [packages/keys/src/chain.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/chain.ts#L31)

***

### scopes

> **scopes**: `string`[]

Defined in: [packages/keys/src/chain.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/chain.ts#L29)
