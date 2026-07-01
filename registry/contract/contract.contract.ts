/**
 * The CONTRACT (Suluk registry: `contract`) — the keystone. It declares the base API surface as `RouteContract`s
 * (via @suluk/hono's `contractDoc`) and DERIVES everything downstream waves consume from that single source:
 *
 *   • `apiDocument(principal?)` — the v4 OpenAPI document, projected PER PRINCIPAL: `emitV4` hides any operation whose
 *     required `scopes` the caller doesn't hold (the WHO axis), so an anonymous caller sees only the public surface.
 *   • `SCOPE_BY_OP` — op-name → its single required scope (the `x-suluk-access` facet), the map the scope gate
 *     (`enforceApiKeyScope`) and the MCP tool-gate read to enforce a keyed caller's grants on the wire.
 *   • `PUBLIC_OPS` — the set of ops that need NO scope (health, pricing catalogs, the signature-verified Stripe webhook).
 *
 * The contract is DERIVED + STATELESS — no schema, no provision. Editing a route here re-projects the doc, the gate,
 * and the MCP surface together, so they can never silently drift. Yours to extend: add a `RouteContract` and its
 * `scopes`, and every derivation picks it up. The v4 document itself is produced by @suluk/hono's `emitV4` (npm the
 * derivation; own the wiring).
 */
import { contractDoc, emitV4, type RouteContract } from "@suluk/hono";
import type { OpenAPIv4Document } from "@suluk/core";

/**
 * The base operation surface. Each op carries a `name` (the v4 by-name handle — C009), a `summary` (documentation
 * coverage is enforced at the type level by `contractDoc`), and, when gated, its required `scopes` — the `x-suluk-access`
 * facet that drives BOTH the per-principal doc filter AND the synthesized 401/403. Public ops omit `scopes`. Responses
 * are kept deliberately simple (a faithful base, not an exhaustive body spec — extend per op as your app firms up).
 */
export const CONTRACT = contractDoc([
  // ---- System (public) ---------------------------------------------------------------------------------------------
  {
    method: "get",
    path: "/api/health",
    name: "health",
    summary: "Liveness check — returns ok + the service name. Public.",
    tags: ["System"],
    responses: [{ status: 200, description: "The service is up." }],
  },

  // ---- Credits -----------------------------------------------------------------------------------------------------
  {
    method: "get",
    path: "/api/credits",
    name: "getCredits",
    summary: "The caller's credit balance.",
    tags: ["Credits"],
    scopes: ["credits:read"],
    responses: [{ status: 200, description: "The current credit balance." }],
  },
  {
    method: "get",
    path: "/api/credits/transactions",
    name: "listTransactions",
    summary: "The caller's recent credit ledger (grants + usage debits), newest first.",
    tags: ["Credits"],
    scopes: ["credits:read"],
    responses: [{ status: 200, description: "The credit transaction ledger." }],
  },
  {
    method: "post",
    path: "/api/credits/debit",
    name: "debitCredits",
    summary: "Atomically debit metered credits; 402 when the balance can't cover the charge.",
    tags: ["Credits"],
    scopes: ["credits:write"],
    errors: [402],
    responses: [{ status: 200, description: "The debit was applied." }],
  },
  {
    method: "post",
    path: "/api/credits/grant",
    name: "grantCredits",
    summary: "Idempotent credit grant (money-IN, safe to retry — keyed on an idempotency key).",
    tags: ["Credits"],
    scopes: ["credits:write"],
    responses: [{ status: 200, description: "The grant was recorded (or replayed)." }],
  },

  // ---- API keys ----------------------------------------------------------------------------------------------------
  {
    method: "get",
    path: "/api/keys",
    name: "listKeys",
    summary: "The caller's API keys with their place in the delegation tree (scopes, caps, usage, lineage).",
    tags: ["API keys"],
    scopes: ["keys:read"],
    responses: [{ status: 200, description: "The API-key list." }],
  },
  {
    method: "post",
    path: "/api/keys/provision",
    name: "provisionKey",
    summary: "Mint a CHILD API key, its caps CLAMPED to the caller's own grant (a child can never out-scope an ancestor). Returns the plaintext key ONCE.",
    tags: ["API keys"],
    scopes: ["keys:write"],
    responses: [{ status: 201, description: "The provisioned key (plaintext returned once)." }],
  },
  {
    method: "post",
    path: "/api/keys/:keyId/revoke",
    name: "revokeKey",
    summary: "Cascade-revoke an API key and every descendant it provisioned, transitively.",
    tags: ["API keys"],
    scopes: ["keys:write"],
    responses: [{ status: 200, description: "The key + its subtree were revoked." }],
  },

  // ---- Activity logs -----------------------------------------------------------------------------------------------
  {
    method: "get",
    path: "/api/logs",
    name: "listLogs",
    summary: "The caller's recent activity — an append-only action log.",
    tags: ["Activity"],
    scopes: ["logs:read"],
    responses: [{ status: 200, description: "Recent activity events." }],
  },

  // ---- Cost --------------------------------------------------------------------------------------------------------
  {
    method: "get",
    path: "/api/cost/summary",
    name: "getCostSummary",
    summary: "The aggregate cost ledger (total + breakdown by principal / operation / action / source).",
    tags: ["Cost"],
    scopes: ["cost:read"],
    responses: [{ status: 200, description: "The aggregate cost summary." }],
  },
  {
    method: "get",
    path: "/api/cost/summary/:userId",
    name: "getUserCostSummary",
    summary: "What one principal cost you — the per-user cost summary.",
    tags: ["Cost"],
    scopes: ["cost:read"],
    responses: [{ status: 200, description: "The per-principal cost summary." }],
  },

  // ---- Billing -----------------------------------------------------------------------------------------------------
  {
    method: "get",
    path: "/api/billing/packs",
    name: "getPacks",
    summary: "Available credit packs (server-authoritative pricing). Public — the frontend reads it pre-sign-in.",
    tags: ["Billing"],
    responses: [{ status: 200, description: "The available credit packs." }],
  },
  {
    method: "get",
    path: "/api/billing/plans",
    name: "getPlans",
    summary: "Available subscription plans (server-authoritative pricing). Public — the frontend reads it pre-sign-in.",
    tags: ["Billing"],
    responses: [{ status: 200, description: "The available subscription plans." }],
  },
  {
    method: "post",
    path: "/api/billing/checkout",
    name: "checkout",
    summary: "Start a Stripe checkout / payment session for a credit top-up; returns the client secret or hosted URL.",
    tags: ["Billing"],
    scopes: ["billing:write"],
    responses: [{ status: 200, description: "The checkout session (client secret / URL)." }],
  },
  {
    method: "get",
    path: "/api/billing/cards/:userId",
    name: "listCards",
    summary: "A user's saved cards (each with its billing address); empty until they have a Stripe customer.",
    tags: ["Billing"],
    scopes: ["billing:read"],
    responses: [{ status: 200, description: "The saved payment methods." }],
  },
  {
    method: "post",
    path: "/api/billing/portal",
    name: "billingPortal",
    summary: "Open the Stripe billing portal to manage/cancel a subscription. Returns the portal URL.",
    tags: ["Billing"],
    scopes: ["billing:write"],
    errors: [404],
    responses: [{ status: 200, description: "The Stripe billing-portal URL." }],
  },

  // ---- Email (internal/ops) ----------------------------------------------------------------------------------------
  {
    method: "post",
    path: "/api/email/send",
    name: "sendEmail",
    summary: "Send a raw transactional message (internal/ops surface — gate in production).",
    tags: ["Email"],
    scopes: ["email:write"],
    errors: [502],
    responses: [{ status: 200, description: "The message was accepted by the provider." }],
  },

  // ---- Webhooks (public, signature-verified) -----------------------------------------------------------------------
  {
    method: "post",
    path: "/api/webhooks/stripe",
    name: "stripeWebhook",
    summary: "Stripe webhook sink — verifies the signature over the RAW body, dedups on the event id, dispatches. Public (no session scope; authenticated by the Stripe signature, not a caller principal).",
    tags: ["Webhooks"],
    errors: [400],
    responses: [{ status: 200, description: "The event was received (Stripe stops redelivering)." }],
  },

  // ---- Erasure (admin) ---------------------------------------------------------------------------------------------
  {
    method: "post",
    path: "/api/erasure/:userId",
    name: "eraseUser",
    summary: "Run the GDPR erasure cascade for a user across every subsystem. ADMIN-only; fail-closed (a failed step aborts with no receipt).",
    tags: ["Admin"],
    scopes: ["admin"],
    errors: [500],
    responses: [{ status: 200, description: "The erasure cascade completed." }],
  },
] satisfies readonly RouteContract[]);

/** The op-name type — the by-name handle each derivation keys on (C009). */
export type OpName = Extract<(typeof CONTRACT)[number]["name"], string>;

/**
 * op-name → its single required scope (the `x-suluk-access` facet). DERIVED from the contract's `scopes` (first entry),
 * so it can never drift from the declared surface. This is the map `enforceApiKeyScope` and the MCP tool-gate read to
 * enforce a keyed caller's grants on the wire — the server is the only authz boundary (C022 inv.3); the facet describes it.
 */
export const SCOPE_BY_OP: Record<string, string> = Object.fromEntries(
  CONTRACT.flatMap((r) => (r.name && r.scopes && r.scopes.length > 0 ? [[r.name, r.scopes[0]] as const] : [])),
);

/**
 * The set of PUBLIC op-names — those that declare NO scope (health, the pricing catalogs, the signature-verified Stripe
 * webhook). DERIVED from the contract, so a newly-added scoped route is never accidentally treated as public. The scope
 * gate / MCP consult this to know which ops bypass the grant check.
 */
export const PUBLIC_OPS: Set<string> = new Set(
  CONTRACT.flatMap((r) => (r.name && (!r.scopes || r.scopes.length === 0) ? [r.name] : [])),
);

/**
 * Build the v4 OpenAPI document, projected for a principal (the WHO axis). Pass the caller's `{ scopes }` to hide any
 * operation whose required scopes they don't hold; omit it for the full public-plus-scoped document (the SDK / docs /
 * conformance project everything). The document is a PURE FUNCTION of the contract × the principal — @suluk/hono's
 * `emitV4` does the derivation (it also synthesizes the RFC-9457 error responses + the 401/403 for scoped ops).
 */
export function apiDocument(principal?: { scopes: string[] }): OpenAPIv4Document {
  const { document } = emitV4(CONTRACT, {
    info: {
      title: "Suluk API",
      version: "0.1.0",
      description: "The derived v4 contract surface (credits, keys, billing, cost, logs, email, webhooks).",
    },
    securityScheme: "apiKey", // scopes → security requirements referencing this scheme
    securitySchemes: { apiKey: { type: "apiKey", in: "header", name: "x-api-key" } }, // declare it so the refs resolve
    ...(principal ? { principal } : {}), // the WHO axis — project the doc to what this caller may see
    synthesizeErrors: true,
  });
  return document;
}
