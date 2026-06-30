import { test, expect, describe } from "bun:test";
import { effectiveCaps, expiredAncestor, disabledAncestor, pooledHeadroom, topCappedPath, clampChildGrant, type ChainNode } from "../src/index";

/**
 * C046 — the delegation-chain algebra (money/abuse-correctness). The pooledHeadroom test is load-bearing: a parent cap
 * must bound the parent + ALL descendants' TOTAL spend, so a key can't multiply its budget by minting children.
 */
const node = (over: Partial<ChainNode> & { keyId: string; path: string }): ChainNode => ({ scopes: [], ownCreditLimit: null, ownRateSharePct: null, ownExpiresAt: null, ...over });

describe("effectiveCaps — ∩ scopes, min caps/expiry up the chain", () => {
  test("scopes intersect; caps + expiry take the min (soonest)", () => {
    const chain = [
      node({ keyId: "root", path: "root", scopes: ["a", "b", "c"], ownCreditLimit: 100, ownRateSharePct: 100, ownExpiresAt: 5000 }),
      node({ keyId: "child", path: "root/child", scopes: ["a", "b"], ownCreditLimit: 40, ownRateSharePct: 50, ownExpiresAt: 3000 }),
    ];
    expect(effectiveCaps(chain)).toEqual({ scopes: ["a", "b"], creditLimit: 40, rateLimitSharePct: 50, expiresAt: 3000 });
  });

  test("a lone root key is the depth-0 identity (its own values)", () => {
    const root = node({ keyId: "r", path: "r", scopes: ["x"], ownCreditLimit: 10, ownRateSharePct: null, ownExpiresAt: null });
    expect(effectiveCaps([root])).toEqual({ scopes: ["x"], creditLimit: 10, rateLimitSharePct: null, expiresAt: null });
  });

  test("an unrestricted ancestor (no scopes node) does not appear; a node with [] scopes intersects to empty", () => {
    const chain = [node({ keyId: "p", path: "p", scopes: ["a"] }), node({ keyId: "c", path: "p/c", scopes: [] })];
    expect(effectiveCaps(chain).scopes).toEqual([]);
  });
});

describe("cascade read-checks", () => {
  const chain = [
    node({ keyId: "root", path: "root", ownExpiresAt: 1000, disabled: true }),
    node({ keyId: "self", path: "root/self", ownExpiresAt: 9999, disabled: false }),
  ];
  test("expiredAncestor is true when a PARENT expired (caller's own expiry excluded)", () => {
    expect(expiredAncestor(chain, "self", 2000)).toBe(true); // root expired at 1000
    expect(expiredAncestor(chain, "self", 500)).toBe(false); // not yet
    expect(expiredAncestor([chain[1]], "self", 999999)).toBe(false); // self only — own expiry ignored here
  });
  test("disabledAncestor is true when a PARENT is soft-disabled (caller's own disable excluded)", () => {
    expect(disabledAncestor(chain, "self")).toBe(true);
    expect(disabledAncestor([chain[1]], "self")).toBe(false);
  });
});

describe("pooledHeadroom — the abuse-proof property", () => {
  test("a parent cap bounds the parent + descendants' TOTAL spend (pooled, not just its own)", () => {
    const chain = [node({ keyId: "root", path: "root", ownCreditLimit: 50 }), node({ keyId: "child", path: "root/child" })];
    const spend = [{ path: "root", spent: 20 }, { path: "root/child", spent: 30 }];
    // pooled: root's subtree spend = 20 + 30 = 50 (NOT just its own 20) → remaining 0
    expect(pooledHeadroom(chain, spend)).toEqual({ limit: 50, spent: 50, remaining: 0 });
  });

  test("the BINDING constraint is the least remaining across every capped node", () => {
    const chain = [node({ keyId: "root", path: "root", ownCreditLimit: 100 }), node({ keyId: "child", path: "root/child", ownCreditLimit: 40 })];
    const spend = [{ path: "root", spent: 10 }, { path: "root/child", spent: 35 }];
    // root: subtree 45 → remaining 55; child: subtree 35 → remaining 5 → binding
    expect(pooledHeadroom(chain, spend)).toEqual({ limit: 40, spent: 35, remaining: 5 });
  });

  test("no cap anywhere → null (only the balance gates)", () => {
    expect(pooledHeadroom([node({ keyId: "r", path: "r" })], [])).toBeNull();
  });

  test("topCappedPath picks the shortest-path capped node (whose subtree covers the rest)", () => {
    const chain = [node({ keyId: "root", path: "root", ownCreditLimit: 100 }), node({ keyId: "c", path: "root/c", ownCreditLimit: 40 })];
    expect(topCappedPath(chain)).toBe("root");
    expect(topCappedPath([node({ keyId: "r", path: "r" })])).toBeNull();
  });
});

describe("clampChildGrant — a child never out-scopes/out-spends a parent", () => {
  const parent = { scopes: ["a", "b"], creditLimit: 40, rateLimitSharePct: 50, expiresAt: 3000 };
  test("scopes ⊆ parent; caps = min(requested, parent)", () => {
    expect(clampChildGrant(parent, { scopes: ["a", "z"], creditLimit: 100, rateLimitSharePct: 10, expiresAt: 9999 })).toEqual({ scopes: ["a"], creditLimit: 40, rateLimitSharePct: 10, expiresAt: 3000 });
  });
  test("a child asking for no expiry INHERITS the parent's; both-null stays null", () => {
    expect(clampChildGrant(parent, { scopes: ["b"] }).expiresAt).toBe(3000);
    expect(clampChildGrant({ scopes: [], creditLimit: null, rateLimitSharePct: null, expiresAt: null }, { scopes: [] }).creditLimit).toBeNull();
  });
});
