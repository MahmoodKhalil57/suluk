/**
 * The ROW-LEVEL authorization engine that pairs with {@link enforceAccess} (the wire-level facet enforcer). A
 * generic CRUD app declares each entity's access MODE; this maps mode → per-operation Rule → a decision: may the
 * caller run it, and is the query SCOPED to their own rows. Pure (no Hono Context — takes the resolved
 * `{ isAdmin, principal }`), so it is testable and reusable. `ruleToRequires` projects a Rule to the wire
 * `requires` level so ONE declaration drives BOTH the CRUD gate AND the `x-suluk-access` facet/docs.
 */
import type { AccessRequires } from "./enforce";

/** A CRUD operation's authorization rule. */
export type Rule = "any" | "owner" | "admin" | "none";
/** The five CRUD operations' rules for one access mode. */
export interface Policy { list: Rule; get: Rule; create: Rule; update: Rule; delete: Rule }
/** The built-in access modes (a sensible SaaS/commerce default set; override via `policyFor`'s `policies` arg). */
export type AccessMode = "public" | "admin" | "submit" | "owned" | "ownedAppend" | "ownedReadonly" | "review";

/** The opt-in default mode→policy preset. Adopt by reference, or pass your own matrix to {@link policyFor}. */
export const DEFAULT_POLICIES: Record<AccessMode, Policy> = {
  // catalog + content: world-readable, admin-writable
  public: { list: "any", get: "any", create: "admin", update: "admin", delete: "admin" },
  // sensitive (e.g. discount codes): admin-only — even reads (listing all is a leak)
  admin: { list: "admin", get: "admin", create: "admin", update: "admin", delete: "admin" },
  // public submissions (contact, newsletter): anyone may create; only admins read/modify
  submit: { list: "admin", get: "admin", create: "any", update: "admin", delete: "admin" },
  // user-owned: each caller only sees/mutates their own rows (admin sees all)
  owned: { list: "owner", get: "owner", create: "owner", update: "owner", delete: "owner" },
  // owned + append-only to the user — place + read your own, but only the system/admin mutates (no self-mark-paid)
  ownedAppend: { list: "owner", get: "owner", create: "owner", update: "admin", delete: "admin" },
  // owned but READ-ONLY to the user — the system/admin even creates it (e.g. billing rows)
  ownedReadonly: { list: "owner", get: "owner", create: "admin", update: "admin", delete: "admin" },
  // public-read, owner-write (e.g. product reviews): everyone reads; you only edit your own
  review: { list: "any", get: "any", create: "owner", update: "owner", delete: "owner" },
};

/** The policy for an access mode (default: owned when an ownerCol is present, else public). `policies` overrides the preset. */
export function policyFor(access: AccessMode | undefined, ownerCol?: string, policies: Record<AccessMode, Policy> = DEFAULT_POLICIES): Policy {
  return policies[access ?? (ownerCol ? "owned" : "public")];
}

/** The resolved caller identity a gate decision needs (compute from your Hono Context: isAdmin flag + principal id). */
export interface GateIdentity { isAdmin: boolean; principal: string | null }
/** A gate decision: may the op run, scope the query to the owner, and — when denied — the honest status. */
export interface GateDecision { ok: boolean; scopeOwner: boolean; status?: 401 | 403 }

/**
 * Decide whether a caller may run an op (per the rule), whether to scope the query to their own rows, and the honest
 * deny status. FAIL-CLOSED: an `owner` op with no principal is 401 (the wire must enforce what `x-suluk-access`
 * claims — a null-scoped empty 200 would let the facet lie); `admin` with no principal is 401, signed-in-non-admin is
 * 403; `none` hard-denies 403. A signed-in owner is scoped to their rows; an admin sees all.
 */
export function gate(rule: Rule, id: GateIdentity): GateDecision {
  switch (rule) {
    case "any": return { ok: true, scopeOwner: false };
    case "owner":
      if (id.isAdmin) return { ok: true, scopeOwner: false };                   // admin sees all
      if (!id.principal) return { ok: false, scopeOwner: false, status: 401 };  // owner op needs a verified caller
      return { ok: true, scopeOwner: true };                                    // signed-in: scoped to own rows
    case "admin":
      if (!id.principal) return { ok: false, scopeOwner: false, status: 401 };  // authenticate first (RFC 7235)
      return id.isAdmin ? { ok: true, scopeOwner: false } : { ok: false, scopeOwner: false, status: 403 }; // signed-in non-admin → 403
    default: return { ok: false, scopeOwner: false, status: 403 };
  }
}

/** Project a CRUD Rule to the wire-level `requires` (so one rule drives BOTH the gate AND the x-suluk-access facet). */
const RULE_TO_REQUIRES: Record<Rule, AccessRequires> = { any: "anyone", owner: "authenticated", admin: "admin", none: "admin" };
export function ruleToRequires(rule: Rule): AccessRequires { return RULE_TO_REQUIRES[rule]; }
