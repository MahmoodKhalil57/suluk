import { test, expect, describe } from "bun:test";
import { escapeLike, subtreeLikePattern, inSubtree, childPath, pathDepth, ancestorIdsOf, parseScopes, parseKeyMeta } from "../src/index";

/** C046 — the materialized-path utilities + the scope/metadata model. */

describe("path utilities", () => {
  test("inSubtree: self (exact) or a descendant (/-prefix); a sibling is NOT in the subtree", () => {
    expect(inSubtree("root", "root")).toBe(true);
    expect(inSubtree("root", "root/child")).toBe(true);
    expect(inSubtree("root", "root2")).toBe(false); // a sibling sharing a prefix is not a descendant
    expect(inSubtree("root/a", "root/b")).toBe(false);
  });
  test("escapeLike guards LIKE wildcards (a keyId can contain `_`)", () => {
    expect(escapeLike("ab_c%d\\e")).toBe("ab\\_c\\%d\\\\e");
    expect(subtreeLikePattern("k_1")).toBe("k\\_1/%");
  });
  test("childPath / pathDepth / ancestorIdsOf", () => {
    expect(childPath("root/a", "b")).toBe("root/a/b");
    expect(childPath(null, "b")).toBe("b");
    expect(pathDepth("root")).toBe(0);
    expect(pathDepth("root/a/b")).toBe(2);
    expect(ancestorIdsOf("root/a/b")).toEqual(["root", "a"]);
  });
});

describe("parseScopes — defensive permissions → scopes", () => {
  test("null / non-JSON / non-object → no scopes (never throws)", () => {
    expect(parseScopes(null)).toEqual([]);
    expect(parseScopes("not json")).toEqual([]);
    expect(parseScopes("42")).toEqual([]);
  });
  test("a valid permissions object yields a non-empty scope list", () => {
    const scopes = parseScopes(JSON.stringify({ tools: ["read", "write"] }));
    expect(Array.isArray(scopes)).toBe(true);
    expect(scopes.length).toBeGreaterThan(0);
  });
});

describe("parseKeyMeta — defensive per-key controls", () => {
  test("absent / bad → null overrides", () => {
    expect(parseKeyMeta(null)).toEqual({ creditLimit: null, rateLimitSharePct: null });
    expect(parseKeyMeta("nope")).toEqual({ creditLimit: null, rateLimitSharePct: null });
  });
  test("reads creditLimit; clamps rateLimitSharePct to [1,100] and rounds", () => {
    expect(parseKeyMeta(JSON.stringify({ creditLimit: 250, rateLimitSharePct: 33.4 }))).toEqual({ creditLimit: 250, rateLimitSharePct: 33 });
    expect(parseKeyMeta(JSON.stringify({ rateLimitSharePct: 0 })).rateLimitSharePct).toBe(1);
    expect(parseKeyMeta(JSON.stringify({ rateLimitSharePct: 999 })).rateLimitSharePct).toBe(100);
  });
});
