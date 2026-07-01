/**
 * `@suluk/keys` — the delegation-chain ALGEBRA for hierarchical API keys (C046, extracted from a real app).
 *
 * The app builds a `ChainNode[]` (a caller + its ancestors) and per-path `SpendRow[]` from its OWN store — the DB query
 * is the seam (a Drizzle reference adapter is a follow-on, deferred per C046) — then calls these PURE functions for the
 * money/abuse-correctness logic so it can never drift:
 *   • effectiveCaps   — scope ∩, credit-cap/rate-share/expiry min up the chain (a child can't out-scope/out-spend a parent)
 *   • pooledHeadroom  — a node's cap bounds its WHOLE subtree's total spend (the abuse-proof property)
 *   • expired/disabledAncestor — the read-time revocation/expiry cascade
 *   • clampChildGrant — clamp a minted child to the parent's effective grant
 * plus the materialized-path utilities and the scope/metadata model.
 */
export {
  type ChainNode, type EffectiveCaps, type SpendRow, type Headroom,
  effectiveCaps, expiredAncestor, disabledAncestor, pooledHeadroom, topCappedPath, clampChildGrant,
} from "./chain";
export { MAX_KEY_DEPTH, escapeLike, subtreeLikePattern, inSubtree, childPath, pathDepth, ancestorIdsOf, pathAt } from "./path";
export { parseScopes, parseKeyMeta } from "./scopes";
// the lineage-tree DB ops (over an injected Drizzle handle) + the pooled-headroom query that joins @suluk/credits.
export { type KeysDB, keyLineage, subtreeOf, parentPathOf, insertLineage, chainHeadroom, revokeKeyTree } from "./lineage";
