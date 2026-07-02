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
import type { MiddlewareHandler } from "hono";
import { z } from "zod";
import { contractDoc, emitV4, type RouteContract } from "@suluk/hono";
import { toProblemDetails, PROBLEM_CONTENT_TYPE, type OpenAPIv4Document } from "@suluk/core";
import { ingestAuthOpenAPI, mergeAuth, authSecuritySchemes } from "@suluk/better-auth";

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
    request: {
      json: z.object({
        userId: z.string().min(1),
        amount: z.number().int().positive(),
        reason: z.string().max(200).optional(),
      }),
    },
    responses: [{ status: 200, description: "The debit was applied." }],
  },
  {
    method: "post",
    path: "/api/credits/grant",
    name: "grantCredits",
    summary: "Idempotent credit grant (money-IN, safe to retry — keyed on an idempotency key).",
    tags: ["Credits"],
    scopes: ["credits:write"],
    request: {
      json: z.object({
        userId: z.string().min(1),
        amount: z.number().int().positive(),
        idemKey: z.string().min(1),
        reason: z.string().max(200).optional(),
      }),
    },
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
    request: {
      json: z.object({
        userId: z.string().min(1),
        parentKeyId: z.string().min(1).optional(),
        // the parent's already-resolved effective caps (an internal shape the app passes through) — bounded, not enumerated.
        parentCaps: z
          .object({
            scopes: z.array(z.string()),
            creditLimit: z.number().int().nonnegative().nullable().optional(),
            rateLimitSharePct: z.number().nonnegative().nullable().optional(),
            expiresAt: z.number().int().nullable().optional(),
          })
          .optional(),
        requested: z.object({
          scopes: z.array(z.string()),
          creditLimit: z.number().int().nonnegative().nullable().optional(),
          rateLimitSharePct: z.number().nonnegative().nullable().optional(),
          expiresAt: z.number().int().nullable().optional(),
        }),
      }),
    },
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
    request: {
      json: z.object({
        packId: z.string().min(1),
        successUrl: z.string().url().max(2048),
        cancelUrl: z.string().url().max(2048),
      }),
    },
    responses: [{ status: 200, description: "The checkout session (client secret / URL)." }],
  },
  {
    method: "post",
    path: "/api/billing/subscribe",
    name: "subscribe",
    summary: "Start a subscription for a plan — one-click (client secret + subscription id) or hosted (checkout URL).",
    tags: ["Billing"],
    scopes: ["billing:write"],
    errors: [400],
    request: {
      json: z.object({
        planId: z.string().min(1),
        hosted: z.boolean().optional(),
        successUrl: z.string().url().max(2048).optional(),
        cancelUrl: z.string().url().max(2048).optional(),
      }),
    },
    responses: [{ status: 200, description: "The subscription session (client secret / URL)." }],
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

  // ══ FULL-SURFACE DECLARATIONS ═══════════════════════════════════════════════════════════════════════════════════
  // Every route the modules actually mount, declared so the v4 document + the scope gate cover the WHOLE surface (not just
  // the base keystone). Scopes match each module's read/write convention — the same scope the tier-2 namespace fallback
  // already applied, so declaring these DOCUMENTS the surface without changing who-can-call-what.

  // ---- Credits (full) ----------------------------------------------------------------------------------------------
  { method: "get", path: "/api/credits/balance/:userId", name: "getUserCredits", summary: "A specific user's credit balance (self/admin).", tags: ["Credits"], scopes: ["credits:read"], responses: [{ status: 200, description: "The user's credit balance." }] },

  // ---- API keys (full) ---------------------------------------------------------------------------------------------
  { method: "get", path: "/api/keys/:keyId/subtree", name: "getKeySubtree", summary: "The delegation subtree rooted at a key (its descendants + their caps/usage).", tags: ["API keys"], scopes: ["keys:read"], responses: [{ status: 200, description: "The key's delegation subtree." }] },

  // ---- Cost (full) -------------------------------------------------------------------------------------------------
  { method: "post", path: "/api/cost/event", name: "recordCostEvent", summary: "Record a per-request cost event (at-least-once; deduped on the idempotency key).", tags: ["Cost"], scopes: ["cost:read"], responses: [{ status: 200, description: "The cost event was recorded (or replayed)." }] },
  { method: "post", path: "/api/cost/dedup", name: "recordCostDedup", summary: "Record a cost dedup marker (the at-least-once ledger for webhook-driven costs).", tags: ["Cost"], scopes: ["cost:read"], responses: [{ status: 200, description: "The dedup marker was recorded." }] },

  // ---- Activity logs (full) ----------------------------------------------------------------------------------------
  { method: "get", path: "/api/logs/query", name: "queryLogs", summary: "Filter the activity log by a parameterized DSL (action / principal / time window).", tags: ["Activity"], scopes: ["logs:read"], responses: [{ status: 200, description: "The filtered activity events." }] },

  // ---- Reference (public docs) -------------------------------------------------------------------------------------
  { method: "get", path: "/api/reference", name: "listReference", summary: "The API tool reference — every operation with its summary + scope. Public.", tags: ["Reference"], responses: [{ status: 200, description: "The tool reference index." }] },
  { method: "get", path: "/api/reference/:tool", name: "getReference", summary: "The reference entry for one tool/operation. Public.", tags: ["Reference"], responses: [{ status: 200, description: "The tool reference entry." }] },

  // ---- Admin -------------------------------------------------------------------------------------------------------
  { method: "get", path: "/api/admin/stats", name: "getAdminStats", summary: "Platform-wide credit + usage stats. ADMIN-only.", tags: ["Admin"], scopes: ["admin"], responses: [{ status: 200, description: "The aggregate platform stats." }] },

  // ---- Billing (full) ----------------------------------------------------------------------------------------------
  { method: "get", path: "/api/billing/payment-config", name: "getPaymentConfig", summary: "The publishable payment config (publishable key + enabled methods) for the client SDK.", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The client payment config." }] },
  { method: "post", path: "/api/billing/payment-intent", name: "createPaymentIntent", summary: "Create a payment intent for a client-confirmed top-up; returns the client secret.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The payment intent (client secret)." }] },
  { method: "get", path: "/api/billing/subscription", name: "getSubscription", summary: "The caller's current subscription (plan, status, period end, cancel-at-period-end).", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The current subscription." }] },
  { method: "post", path: "/api/billing/subscription", name: "cancelSubscription", summary: "Cancel (or schedule cancellation of) the caller's subscription.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The subscription was updated." }] },
  { method: "post", path: "/api/billing/subscription-plan", name: "changeSubscriptionPlan", summary: "Switch the caller's subscription to a different plan (prorated).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The plan change was applied." }] },
  { method: "get", path: "/api/billing/purchase-quote", name: "getPurchaseQuote", summary: "A server-authoritative quote (tax + total) for a credit-pack purchase before checkout.", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The purchase quote." }] },
  { method: "get", path: "/api/billing/refund-quote", name: "getRefundQuote", summary: "How much of a purchase is refundable (credits already spent are deducted).", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The refund quote." }] },
  { method: "post", path: "/api/billing/refund", name: "refund", summary: "Refund a purchase — DEBITS the granted credits before moving cash (partial-capped; re-credits any shortfall).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The refund was processed." }] },
  { method: "get", path: "/api/billing/methods", name: "listMethods", summary: "The caller's saved payment methods (cards), the default flagged.", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The saved payment methods." }] },
  { method: "post", path: "/api/billing/methods/default", name: "setDefaultMethod", summary: "Set a saved card as the default for off-session charges.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The default payment method was set." }] },
  { method: "post", path: "/api/billing/methods/delete", name: "deleteMethod", summary: "Detach a saved card from the caller's Stripe customer.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The payment method was detached." }] },
  { method: "post", path: "/api/billing/customer", name: "ensureCustomer", summary: "Ensure the caller has a Stripe customer (idempotent) — used before saving a card.", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The Stripe customer id." }] },
  { method: "post", path: "/api/billing/payment-session", name: "createPaymentSession", summary: "Create a client payment session (Element auto-PM or one-click on the default card).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The client payment session." }] },
  { method: "post", path: "/api/billing/setup-session", name: "createSetupSession", summary: "Create a setup session to save a card off-session (no charge).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The setup session (client secret)." }] },
  { method: "get", path: "/api/billing/auto-topup", name: "getAutoTopup", summary: "The caller's auto-recharge config (threshold + pack, or disabled).", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The auto-topup config." }] },
  { method: "post", path: "/api/billing/auto-topup", name: "setAutoTopup", summary: "Enable/update/disable auto-recharge (top up when the balance falls below a threshold).", tags: ["Billing"], scopes: ["billing:write"], responses: [{ status: 200, description: "The auto-topup config was saved." }] },
  { method: "get", path: "/api/billing/payment-health", name: "getPaymentHealth", summary: "Standing payment-health flags for the caller (failed charges, expiring cards, dunning).", tags: ["Billing"], scopes: ["billing:read"], responses: [{ status: 200, description: "The payment-health flags." }] },

  // ---- MCP connections (session-only management) -------------------------------------------------------------------
  { method: "get", path: "/api/mcp/connections", name: "listMcpConnections", summary: "The caller's MCP OAuth connections (per-client config). Session-only.", tags: ["MCP"], responses: [{ status: 200, description: "The MCP connections." }] },
  { method: "post", path: "/api/mcp/connections/update", name: "updateMcpConnection", summary: "Update an MCP connection's config. Session-only.", tags: ["MCP"], responses: [{ status: 200, description: "The connection was updated." }] },
  { method: "post", path: "/api/mcp/connections/revoke", name: "revokeMcpConnection", summary: "Revoke an MCP connection (drops its tokens). Session-only.", tags: ["MCP"], responses: [{ status: 200, description: "The connection was revoked." }] },
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

/** true when the Better Auth `api` can emit its own OpenAPI (the `openAPI()` plugin is enabled in `buildAuth`). */
function hasOpenApiGenerator(x: unknown): x is { generateOpenAPISchema: () => Promise<Record<string, unknown>> } {
  return typeof (x as { generateOpenAPISchema?: unknown } | null)?.generateOpenAPISchema === "function";
}

/**
 * The FULL v4 document INCLUDING Better Auth's own surface (sign-in/up/out, get-session, social sign-in, …) — so
 * BETTER-AUTH CLIENTS can discover + call the auth API from the same `/api/openapi.json`, exactly like toolfactory does.
 * It ingests the `openAPI()`-generated OAS 3.0 (`auth.api.generateOpenAPISchema()`) → v4 (@suluk/better-auth's
 * `ingestAuthOpenAPI`) → merges it into {@link apiDocument} (`mergeAuth`). ASYNC: the auth schema comes from a LIVE,
 * per-request auth instance (Workers build it via `createAuth(c.env)`). Best-effort — if the generator is absent or throws
 * it falls back to the base doc (never throws), so `/api/openapi.json` always serves at least the app surface. The APP wins
 * a path collision (a barebones auth op never clobbers a typed contract op); Better Auth only emits enabled routes.
 */
export async function apiDocumentWithAuth(authApi: unknown, principal?: { scopes: string[] }): Promise<OpenAPIv4Document> {
  const base = apiDocument(principal);
  if (!hasOpenApiGenerator(authApi)) return base;
  try {
    const authV4 = ingestAuthOpenAPI(await authApi.generateOpenAPISchema(), { basePath: "/api/auth" });
    const authOnly = { ...authV4, paths: Object.fromEntries(Object.entries(authV4.paths).filter(([p]) => !(p in base.paths))) };
    const { securitySchemes } = authSecuritySchemes({ session: true }); // declare the session-cookie scheme the auth ops reference
    return mergeAuth(base, authOnly, { securitySchemes });
  } catch (err) {
    // fall back to the base doc, but NOT silently — a bare swallow would serve an auth-LESS doc with zero signal.
    console.warn("apiDocumentWithAuth: Better Auth OpenAPI ingest failed — serving the base doc (auth surface ABSENT)", err);
    return base;
  }
}

/**
 * Resolve the required scope a request maps to. TWO tiers, so a keyed caller can NEVER reach an unlisted sub-path ungated:
 *   1. EXACT op — the longest static-path-prefix + method match among declared ops (a `GET /api/credits/balance/x` resolves
 *      to the `getCredits` op at `/api/credits`; a declared-public op like `/api/billing/packs` returns scope `undefined`).
 *   2. MODULE fallback — if no op matched, gate by the /api/<module> namespace: use the module's WRITE scope for a write
 *      method, else its READ scope (derived from any declared op in that module). This closes the hole where a module
 *      (e.g. billing) exposes many sub-paths but declares only a few ops — an undeclared `POST /api/billing/refund` is still
 *      gated `billing:write`. Returns `undefined` only for a genuinely non-contract module (no gate).
 * The METHOD disambiguates read vs write throughout (GET/HEAD → read, else write).
 */
/**
 * TIER-1 route match — the exact declared op a request resolves to: the longest static-path-prefix + same-method match
 * among the CONTRACT (a `GET /api/credits/balance/x` → the `getCredits` op at `/api/credits`). The single matcher both
 * `scopeForRequest` (the scope gate) and `validateRequest` (the body gate) read, so they can never disagree on WHICH op
 * a wire request maps to. Returns the whole {@link RouteContract} (name + scopes + request), or `undefined` if none match.
 */
export function matchRoute(method: string, path: string): RouteContract | undefined {
  const m = method.toUpperCase();
  let best: RouteContract | undefined;
  let bestLen = -1;
  for (const r of CONTRACT) {
    if (r.method.toUpperCase() !== m) continue;
    const base = r.path.split("/:")[0]; // the static prefix before any :param
    if ((path === base || path === r.path || path.startsWith(base + "/")) && base.length > bestLen) {
      best = r;
      bestLen = base.length;
    }
  }
  return best;
}

export function scopeForRequest(method: string, path: string): { op: string; scope?: string } | undefined {
  const m = method.toUpperCase();
  const wantWrite = m !== "GET" && m !== "HEAD";
  // tier 1 — exact op (longest static-prefix, same method)
  const best = matchRoute(method, path);
  if (best?.name) return { op: best.name, scope: best.scopes?.[0] };

  // tier 2 — module fallback: gate an undeclared sub-path by its /api/<module> namespace scope (read vs write).
  const modulePrefix = `/api/${path.split("/")[2] ?? ""}`;
  if (modulePrefix === "/api/") return undefined;
  let readScope: string | undefined;
  let writeScope: string | undefined;
  let known = false;
  for (const r of CONTRACT) {
    if (r.path !== modulePrefix && !r.path.startsWith(modulePrefix + "/")) continue;
    known = true;
    const s = r.scopes?.[0];
    if (!s) continue;
    if (r.method.toUpperCase() === "GET") readScope ??= s;
    else writeScope ??= s;
  }
  if (!known) return undefined; // not a contract module → no gate
  const scope = wantWrite ? (writeScope ?? readScope) : (readScope ?? writeScope);
  return { op: modulePrefix, scope };
}

/**
 * SCOPE-GATE for KEYED callers (an `x-api-key` / MCP caller — a `keyId` is on the context). A key holds a SUBSET of its
 * owner's access, so a scoped op requires the key to hold that op's scope (from the contract's `x-suluk-access` facet).
 * SESSION callers (no `keyId`) pass straight through — a signed-in user is unrestricted here (their own auth gates apply).
 * Runs AFTER `apiKeyAuth` (which set `keyId` + `scopes`). The server is the ONLY authz boundary; the facet describes it.
 */
export const enforceApiKeyScope: MiddlewareHandler = async (c, next) => {
  const keyId = c.get("keyId") as string | undefined;
  if (!keyId) return next(); // session / anonymous → unrestricted at this gate
  const path = new URL(c.req.url).pathname;
  const match = scopeForRequest(c.req.method, path);
  if (!match || !match.scope) return next(); // non-contract path or a public op → allow
  const scopes = (c.get("scopes") as string[] | undefined) ?? [];
  if (!scopes.includes(match.scope)) {
    return c.json(toProblemDetails({ tag: "ForbiddenError", detail: `This API key is missing the "${match.scope}" scope.` }), 403, {
      "content-type": PROBLEM_CONTENT_TYPE,
    });
  }
  return next();
};

/** The methods that carry a body — the only ones `validateRequest` inspects (GET/HEAD/DELETE/OPTIONS skip). */
const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

/**
 * CONTRACT-DERIVED request-body validation. Resolves the op the SAME way the scope gate does ({@link matchRoute} —
 * longest static-prefix + method), and, IF that op declares a `request.json` schema AND the method carries a body,
 * parses `c.req.json()` with it. On a schema failure it synthesizes an RFC-9457 400 (`ValidationError`) with the flattened
 * Zod issues in `errors`; on success it stashes the parsed body at `c.set("validatedBody", …)` (handlers may re-read the
 * body themselves — this doesn't consume the stream for them, it only ADDS the pre-parsed value). Any op WITHOUT a
 * declared `request.json` (or any GET/HEAD) passes straight through, so the gate only ever tightens declared ops — it
 * never blocks an undeclared surface. Mount AFTER `enforceApiKeyScope` (a missing scope 403 precedes a bad-body 400).
 */
export const validateRequest: MiddlewareHandler = async (c, next) => {
  if (!BODY_METHODS.has(c.req.method.toUpperCase())) return next(); // no body to validate
  const path = new URL(c.req.url).pathname;
  const route = matchRoute(c.req.method, path);
  const schema = route?.request?.json;
  if (!schema) return next(); // no declared body schema for this op → nothing to validate

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(toProblemDetails({ tag: "ValidationError", detail: "The request body is not valid JSON." }), 400, {
      "content-type": PROBLEM_CONTENT_TYPE,
    });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      toProblemDetails({
        tag: "ValidationError",
        detail: "The request body does not satisfy the operation's contract.",
        errors: parsed.error.flatten().fieldErrors as Record<string, unknown>,
      }),
      400,
      { "content-type": PROBLEM_CONTENT_TYPE },
    );
  }

  // stash the parsed body for any handler that wants it (handlers re-read c.req.json() as before). `validatedBody` isn't a
  // declared Variable on this app's context (the registry keeps the contract mount decoupled from AppVars), so cast the set.
  (c as { set: (k: string, v: unknown) => void }).set("validatedBody", parsed.data);
  return next();
};
