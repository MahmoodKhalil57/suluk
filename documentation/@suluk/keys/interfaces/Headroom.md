[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / Headroom

# Interface: Headroom

Defined in: [packages/keys/src/chain.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/keys/src/chain.ts#L71)

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

### limit

> **limit**: `number`

Defined in: [packages/keys/src/chain.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/keys/src/chain.ts#L72)

***

### remaining

> **remaining**: `number`

Defined in: [packages/keys/src/chain.ts:74](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/keys/src/chain.ts#L74)

***

### spent

> **spent**: `number`

Defined in: [packages/keys/src/chain.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/keys/src/chain.ts#L73)
