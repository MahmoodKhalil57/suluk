---
description: "The delegation-chain ALGEBRA for hierarchical API keys: effective-caps (scope ∩, cap/expiry min up the chain), POOLED subtree headroom (a parent cap bounds parent+children TOTAL spend — abuse-proof), the cascade read-checks (expired/disabled ancestor), child-grant clamping, the materialized-path utilities, and the scope/metadata model. Pure + portable: the app supplies the chain rows + spend (its DB query is the seam); this owns the money/abuse-correctness logic. Extracted from a real app (C046). CANDIDATE tooling."
name: suluk-keys
---

# @suluk/keys

The delegation-chain ALGEBRA for hierarchical API keys: effective-caps (scope ∩, cap/expiry min up the chain), POOLED subtree headroom (a parent cap bounds parent+children TOTAL spend — abuse-proof), the cascade read-checks (expired/disabled ancestor), child-grant clamping, the materialized-path utilities, and the scope/metadata model. Pure + portable: the app supplies the chain rows + spend (its DB query is the seam); this owns the money/abuse-correctness logic. Extracted from a real app (C046). CANDIDATE tooling.

## Quick Start

```ts
import { effectiveCaps, pooledHeadroom, clampChildGrant, type ChainNode } from "@suluk/keys";

// A caller's chain: root → parent → self (each with its OWN grant).
const chain: ChainNode[] = [
  { keyId: "root", path: "root", scopes: ["credits:read", "ask"], ownCreditLimit: 100, ownRateSharePct: null, ownExpiresAt: null },
  { keyId: "child", path: "root/child", scopes: ["ask"], ownCreditLimit: 30, ownRateSharePct: null, ownExpiresAt: null },
];

const caps = effectiveCaps(chain);
caps.scopes;       // ["ask"]  — the intersection
caps.creditLimit;  // 30       — the min declared cap

// Pooled headroom: the BINDING constraint a charge must clear across the subtree.
const headroom = pooledHeadroom(chain, [{ path: "root/child", spent: 10 }]);
headroom; // { limit: 30, spent: 10, remaining: 20 } — or null when nothing is capped
```

## Quick Reference

**chain:** `effectiveCaps` (The caller's EFFECTIVE grant, derived by walking UP the chain), `expiredAncestor` (TRUE when any ANCESTOR (a node other than the caller) has already expired — so the caller auto-expires the moment a
 parent does), `disabledAncestor` (TRUE when any ANCESTOR has been soft-disabled — so a child auto-dies the moment a parent is revoked, EVEN when the
 revocation didn't cascade through the write path), `pooledHeadroom` (The chain's POOLED credit headroom — the BINDING constraint a charge must clear: over every node that declares an own
cap, the LEAST `cap − subtreeSpend(node)` (a node's subtree = itself ∪ descendants)), `topCappedPath` (The topmost capped node in a chain (the shortest path) — whose subtree contains every other capped node's subtree, so
 one query over it suffices for pooledHeadroom), `clampChildGrant` (Clamp a requested CHILD grant to the parent's EFFECTIVE grant — a child can never out-scope or out-spend an ancestor), `ChainNode` (One node of a caller's chain — itself or an ancestor — with its OWN (pre-chain) grant + caps + its materialized path), `EffectiveCaps` (`@suluk/keys` — the delegation-chain ALGEBRA for hierarchical API keys (C046, extracted from a real app)), `SpendRow` (One row of per-path spend (a positive amount), as the app's subtree query returns it), `Headroom` (`@suluk/keys` — the delegation-chain ALGEBRA for hierarchical API keys (C046, extracted from a real app))
**path:** `escapeLike` (Escape SQL-LIKE metacharacters (a keyId can contain `_`, a LIKE wildcard) so a path prefix matches LITERALLY — pair
 with `ESCAPE '\'` in the query), `subtreeLikePattern` (The `LIKE` pattern for "<path>'s strict descendants" — pair with `ESCAPE '\'`), `inSubtree` (TRUE when `candidate` is within `path`'s subtree: the node itself (exact) OR a descendant (a "/"-prefix)), `childPath` (A child's path = `parentPath/childId`, or the bare `childId` when the parent is a root (no path / a session caller)), `pathDepth` (Depth of a path: 0 = root, >0 = a delegated child), `ancestorIdsOf` (The ancestor keyIds in a path (everything before self), root→parent order), `pathAt` (The own-path of the ancestor at index `i` in a path's segments (the prefix up to and including it)), `MAX_KEY_DEPTH` (A delegation chain can be at most this deep (root)
**scopes:** `parseScopes` (permissions JSON (`{resource:[actions]}`) → flat `["resource:action"]` scopes, defensively (a bad value → no scopes)), `parseKeyMeta` (metadata JSON → the per-key controls (each null when absent/invalid): the PAID credit cap + the rate-limit share %)
**lineage:** `subtreeOf` (The keyIds in a node's subtree (itself + every descendant) — for cascade revoke), `parentPathOf` (A parent's materialized path (for building a child's path)), `insertLineage` (Record a freshly-minted child (or root, when parentKeyId is null) in the lineage tree), `chainHeadroom` (The chain's POOLED credit headroom — one grouped query over the TOPMOST capped node's subtree (joining the credit
ledger via the `credit_key` sidecar), then pooledHeadroom), `revokeKeyTree` (Cascade-revoke a key's subtree: compute the api-key ids in `keyId`'s subtree (a keyed caller may revoke ONLY a STRICT
descendant of itself — not itself, an ancestor, or another branch) and soft-disable them via the injected `disableKeys`
(the app's apikey update — so @suluk/keys stays free of the Better Auth apikey table)), `KeysDB` (The injected DB handle (drizzle/d1 in prod; bun:sqlite bridged in tests)), `keyLineage` (The delegation tree: each node's parent + a materialized `path` of keyIds (root→…→self))

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)