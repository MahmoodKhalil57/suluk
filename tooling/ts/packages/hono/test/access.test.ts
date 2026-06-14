/**
 * The row-level CRUD authorization engine — gate() decisions (fail-closed 401/403 + owner-scoping), policyFor
 * preset resolution + override, and ruleToRequires (the rule→wire-requires projection that keeps the CRUD gate and
 * the x-suluk-access facet in lockstep).
 */
import { test, expect, describe } from "bun:test";
import { gate, policyFor, ruleToRequires, DEFAULT_POLICIES, type Rule } from "../src/index";

describe("gate", () => {
  test("any → open, no scope", () => {
    expect(gate("any", { isAdmin: false, principal: null })).toEqual({ ok: true, scopeOwner: false });
  });
  test("owner: anon → 401, signed-in → scoped, admin → all", () => {
    expect(gate("owner", { isAdmin: false, principal: null })).toEqual({ ok: false, scopeOwner: false, status: 401 });
    expect(gate("owner", { isAdmin: false, principal: "u1" })).toEqual({ ok: true, scopeOwner: true });
    expect(gate("owner", { isAdmin: true, principal: "u1" })).toEqual({ ok: true, scopeOwner: false }); // admin sees all
  });
  test("admin: anon → 401 (authenticate first), signed-in-non-admin → 403, admin → ok", () => {
    expect(gate("admin", { isAdmin: false, principal: null })).toEqual({ ok: false, scopeOwner: false, status: 401 });
    expect(gate("admin", { isAdmin: false, principal: "u1" })).toEqual({ ok: false, scopeOwner: false, status: 403 });
    expect(gate("admin", { isAdmin: true, principal: "u1" })).toEqual({ ok: true, scopeOwner: false });
  });
  test("none → hard 403", () => {
    expect(gate("none", { isAdmin: true, principal: "u1" })).toEqual({ ok: false, scopeOwner: false, status: 403 });
  });
});

describe("policyFor", () => {
  test("resolves modes, defaults owned-with-ownerCol / public-without, honors an override matrix", () => {
    expect(policyFor("owned").update).toBe("owner");
    expect(policyFor("ownedAppend").update).toBe("admin"); // no self-mutate
    expect(policyFor(undefined, "customerId")).toEqual(DEFAULT_POLICIES.owned);
    expect(policyFor(undefined)).toEqual(DEFAULT_POLICIES.public);
    const custom = { ...DEFAULT_POLICIES, public: { ...DEFAULT_POLICIES.public, list: "admin" as Rule } };
    expect(policyFor("public", undefined, custom).list).toBe("admin");
  });
});

describe("ruleToRequires", () => {
  test("projects a CRUD rule to the wire requires level", () => {
    expect(ruleToRequires("any")).toBe("anyone");
    expect(ruleToRequires("owner")).toBe("authenticated");
    expect(ruleToRequires("admin")).toBe("admin");
    expect(ruleToRequires("none")).toBe("admin");
  });
});
