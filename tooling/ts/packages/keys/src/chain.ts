/**
 * The delegation-chain ALGEBRA (C046) — the money/abuse-correctness logic, pure and portable. A caller's chain is itself
 * (last) + its ancestors (root→parent), each a {@link ChainNode} with its OWN granted scopes + caps + expiry. The four
 * rules that keep a child from ever out-scoping or out-spending an ancestor:
 *   • effectiveCaps  — scopes = ∩ up the chain, credit-cap/rate-share/expiry = the MIN (soonest) of the declared ones.
 *   • pooledHeadroom — a node's cap bounds its WHOLE subtree's total spend (pooling = the abuse-proof property).
 *   • expired/disabledAncestor — a child dies the moment a parent up the chain expires or is revoked (the read-time cascade).
 *   • clampChildGrant — a freshly-minted child is clamped to the parent's effective grant.
 * The app supplies the rows (its DB query is the seam); this owns the algebra. Extracted verbatim from the source.
 */
import { inSubtree } from "./path";

/** One node of a caller's chain — itself or an ancestor — with its OWN (pre-chain) grant + caps + its materialized path. */
export interface ChainNode {
  keyId: string;
  /** the node's own materialized path (a prefix of the caller's) — used to sum its subtree spend. */
  path: string;
  /** the node's OWN granted tool scopes (an unrestricted account-root never appears as a node). */
  scopes: string[];
  ownCreditLimit: number | null;
  ownRateSharePct: number | null;
  /** epoch ms — the node's own expiry; null = never. */
  ownExpiresAt: number | null;
  /** an ancestor soft-disabled (enabled=false) — drives the auth-time revocation cascade. */
  disabled?: boolean;
}

export interface EffectiveCaps {
  scopes: string[];
  creditLimit: number | null;
  rateLimitSharePct: number | null;
  expiresAt: number | null;
}

/** The caller's EFFECTIVE grant, derived by walking UP the chain. Scopes = the intersection of every node's grant; the
 *  credit cap + rate share + expiry = the MIN (soonest) of the declared (non-null) ones. The depth-0 identity for a plain
 *  root key (one node → its own values), so single-key behaviour is preserved. */
export function effectiveCaps(chain: ChainNode[]): EffectiveCaps {
  let scopes: string[] | null = null;
  for (const n of chain) scopes = scopes == null ? [...n.scopes] : scopes.filter((s) => n.scopes.includes(s));
  const limits = chain.map((n) => n.ownCreditLimit).filter((x): x is number => x != null);
  const shares = chain.map((n) => n.ownRateSharePct).filter((x): x is number => x != null);
  const expiries = chain.map((n) => n.ownExpiresAt).filter((x): x is number => x != null);
  return {
    scopes: scopes ?? [],
    creditLimit: limits.length ? Math.min(...limits) : null,
    rateLimitSharePct: shares.length ? Math.min(...shares) : null,
    expiresAt: expiries.length ? Math.min(...expiries) : null, // soonest up the chain — a child can't outlive any ancestor
  };
}

/** TRUE when any ANCESTOR (a node other than the caller) has already expired — so the caller auto-expires the moment a
 *  parent does. The caller's OWN expiry is enforced upstream (the token verify rejects it), so it's excluded. */
export function expiredAncestor(chain: ChainNode[], callerKeyId: string, now: number): boolean {
  return chain.some((n) => n.keyId !== callerKeyId && n.ownExpiresAt != null && n.ownExpiresAt <= now);
}

/** TRUE when any ANCESTOR has been soft-disabled — so a child auto-dies the moment a parent is revoked, EVEN when the
 *  revocation didn't cascade through the write path. The read-time half of the cascade. The caller's OWN disable is
 *  enforced upstream, so it's excluded. */
export function disabledAncestor(chain: ChainNode[], callerKeyId: string): boolean {
  return chain.some((n) => n.keyId !== callerKeyId && n.disabled === true);
}

/** One row of per-path spend (a positive amount), as the app's subtree query returns it. */
export interface SpendRow {
  path: string;
  spent: number;
}

export interface Headroom {
  limit: number;
  spent: number;
  remaining: number;
}

/**
 * The chain's POOLED credit headroom — the BINDING constraint a charge must clear: over every node that declares an own
 * cap, the LEAST `cap − subtreeSpend(node)` (a node's subtree = itself ∪ descendants). Pooling is what makes a cap
 * abuse-proof: a parent capped at 50 can't mint children to spend 50 each, because every child's spend lands in the
 * parent's subtree. The app fetches `spendRows` (per-path spend over the topmost capped node's subtree — one grouped
 * query); this sums per node in O(nodes × rows). Returns null when no node declares a cap (uncapped — only the balance gates).
 */
export function pooledHeadroom(chain: ChainNode[], spendRows: readonly SpendRow[]): Headroom | null {
  const capped = chain.filter((n): n is ChainNode & { ownCreditLimit: number } => n.ownCreditLimit != null);
  if (capped.length === 0) return null;
  let binding: Headroom | null = null;
  for (const node of capped) {
    let spent = 0;
    for (const r of spendRows) if (inSubtree(node.path, r.path)) spent += Number(r.spent);
    const remaining = node.ownCreditLimit - spent;
    if (binding === null || remaining < binding.remaining) binding = { limit: node.ownCreditLimit, spent, remaining };
  }
  return binding;
}

/** The topmost capped node in a chain (the shortest path) — whose subtree contains every other capped node's subtree, so
 *  one query over it suffices for {@link pooledHeadroom}. Null when no node declares a cap. */
export function topCappedPath(chain: ChainNode[]): string | null {
  const capped = chain.filter((n) => n.ownCreditLimit != null);
  if (!capped.length) return null;
  return capped.reduce((a, b) => (a.path.split("/").length <= b.path.split("/").length ? a : b)).path;
}

/** Clamp a requested CHILD grant to the parent's EFFECTIVE grant — a child can never out-scope or out-spend an ancestor.
 *  scopes ⊆ parent's; each cap/expiry = min(requested ?? ∞, parent ?? ∞) (null only when BOTH are unbounded). Pure. */
export function clampChildGrant(
  parent: EffectiveCaps,
  requested: { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null },
): EffectiveCaps {
  const minOrNull = (a: number | null | undefined, b: number | null): number | null => {
    const xs = [a, b].filter((x): x is number => typeof x === "number");
    return xs.length ? Math.min(...xs) : null;
  };
  return {
    scopes: requested.scopes.filter((s) => parent.scopes.includes(s)),
    creditLimit: minOrNull(requested.creditLimit, parent.creditLimit),
    rateLimitSharePct: minOrNull(requested.rateLimitSharePct, parent.rateLimitSharePct),
    // a child that asks for no/longer expiry INHERITS the parent's (min of one finite + ∞ = the finite one).
    expiresAt: minOrNull(requested.expiresAt, parent.expiresAt),
  };
}
