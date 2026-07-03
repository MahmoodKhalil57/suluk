/**
 * The MCP mount (Suluk registry: `mcp`) — a MIDDLEWARE mount that turns the ONE v4 contract into an agent-callable surface
 * under `/api/mcp`, wiring three things onto your app (own the wiring; npm the protocol + the OAuth server):
 *
 *   1. The MCP JSON-RPC server (`@suluk/mcp`'s `mcpApp`), PER-CALLER scope-projected: its `document` is a per-request
 *      `apiDocument({ scopes })` off the caller's principal, so `tools/list` shows only the tools this caller can call
 *      (the contract-first payoff — this REPLACES a hand-maintained MCP tool list). `exec: appExec(app)` dispatches each
 *      tool call IN-PROCESS through this SAME app (NOT a self-fetch to the public origin — that loops the edge and 522s
 *      on Cloudflare); the inner request re-enters `/api/*`, so it is identity-resolved + scope-gated identically.
 *      `include:"all"` exposes mutations as tools too — each still gated per-caller by the same scope machinery.
 *   2. The OAuth 2.1 discovery documents at the ROOT origin (`/.well-known/oauth-authorization-server` +
 *      `/.well-known/oauth-protected-resource`) — Better Auth's `mcp()` plugin serves them under `/api/auth/.well-known/*`,
 *      but MCP clients probe the origin root, so re-expose the plugin's helpers here (from `better-auth/plugins`).
 *      Requires `mountAuthRoutes(app, { mcp: {…} })` — the plugin must be enabled for `getMcpOAuthConfig` to exist.
 *   3. The connections management routes (`mcpConnectionsRoutes`), registered BEFORE `mcpApp` so the specific
 *      `/api/mcp/connections*` paths are matched first and NOT swallowed by mcpApp's `/api/mcp` JSON-RPC handler.
 *
 * Wired into the generated entry as `mountMcp(app)`. Place it AFTER `auth` (so the bearer/session/api-key caller is
 * resolved) and AFTER `contract` (the scope gate) in the manifest.
 */
import type { Context, Hono } from "hono";
import { z } from "zod";
import { mcpApp, appExec, type FetchApp } from "@suluk/mcp";
import { oAuthDiscoveryMetadata, oAuthProtectedResourceMetadata } from "better-auth/plugins";
import type { OpenAPIv4Document } from "@suluk/core";
import type { RouteContract } from "@suluk/hono";
import type { Bindings } from "../app";
import { mcpConnectionsRoutes } from "./mcp-connections";
// NO `../contract` or `../auth` import — DECOUPLED. The v4 doc PROJECTOR (`apiDocument`) arrives via the `apiDocument`
// mount-opt (auto-wired from contract — mcp is the contract projected, a HARD peer it `requires`); the Better-Auth INSTANCE
// for the OAuth discovery docs arrives via the optional `mcpAuthInstance` mount-opt (wired from auth, gated on the mcp()
// plugin). So `mcp` imports only `../app` + its own files + `@suluk/*` — every cross-module edge is a wire.

const BASE_PATH = "/api/mcp";

// ── the module's CONTRACT fragment, co-located with the routes it describes (replaces `mcp.contract.ts`) ──
// The session-only `/api/mcp/connections/*` management ops. The JSON-RPC + OAuth surfaces are bespoke-mounted (mcpApp /
// discovery), so these are documented literals; they bubble up via `mcpOps` (spread by `src/contract.ops.ts`).

/** One MCP connection knob-row as returned to the owner (matches `McpConnectionView` from the connections service). */
const McpConnectionViewSchema = z.object({
  clientId: z.string(),
  /** the attributed-spend id (`mcp:<userId>:<clientId>`) — the key the connection's usage is charged under. */
  keyId: z.string(),
  creditCap: z.number().int().nullable(),
  rateSharePct: z.number().int().nullable(),
  disabled: z.boolean(),
  createdAt: z.number().int(),
});

/** The `{ ok: true }` acknowledgement returned by update / revoke. */
const OkSchema = z.object({ ok: z.boolean() });

export const mcpOps = [
  {
    method: "get",
    path: "/api/mcp/connections",
    name: "listMcpConnections",
    summary: "The caller's MCP OAuth connections (per-client config). Session-only.",
    cost: { components: [], infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "rate-limited" } },
    tags: ["MCP"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    errors: [401, 403],
    responses: [{ status: 200, description: "The MCP connections.", schema: z.object({ connections: z.array(McpConnectionViewSchema) }) }],
  },
  {
    method: "post",
    path: "/api/mcp/connections/update",
    name: "updateMcpConnection",
    summary: "Update an MCP connection's config. Session-only.",
    cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
    tags: ["MCP"],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    errors: [400, 401, 403],
    request: {
      json: z.object({
        clientId: z.string().min(1),
        creditCap: z.number().int().nullable().optional(),
        rateSharePct: z.number().int().nullable().optional(),
        disabled: z.boolean().optional(),
      }),
    },
    responses: [{ status: 200, description: "The connection was updated.", schema: OkSchema }],
  },
  {
    method: "post",
    path: "/api/mcp/connections/revoke",
    name: "revokeMcpConnection",
    summary: "Revoke an MCP connection (drops its tokens). Session-only.",
    cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
    tags: ["MCP"],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    errors: [400, 401, 403],
    request: { json: z.object({ clientId: z.string().min(1) }) },
    responses: [{ status: 200, description: "The connection was revoked.", schema: OkSchema }],
  },
] satisfies readonly RouteContract[];

export interface MountMcpOptions {
  /** wired from contract (auto-injected — mcp `requires: ["contract"]`): the per-caller v4 doc projector. */
  apiDocument: (principal?: { scopes: string[] }) => OpenAPIv4Document;
  /** wired from auth: a factory returning the Better-Auth INSTANCE (with the mcp() plugin) for the OAuth discovery docs. */
  mcpAuthInstance?: (env: Bindings) => unknown;
}

export function mountMcp<T extends Hono<{ Bindings: Bindings }>>(app: T, opts: MountMcpOptions): T {
  // (3) connections management — registered BEFORE mcpApp so `/api/mcp/connections*` isn't swallowed by the JSON-RPC route.
  app.route(BASE_PATH, mcpConnectionsRoutes());

  // (2) OAuth discovery at the ROOT origin (where MCP clients probe) — ONLY when auth's mcp() plugin is wired in via
  //     `mcpAuthInstance`. Both plugin helpers take the auth instance + return a `(Request) => Promise<Response>`.
  const authInstance = opts?.mcpAuthInstance;
  if (authInstance) {
    app.get("/.well-known/oauth-authorization-server", (c) => oAuthDiscoveryMetadata(authInstance(c.env) as Parameters<typeof oAuthDiscoveryMetadata>[0])(c.req.raw));
    app.get("/.well-known/oauth-protected-resource", (c) => oAuthProtectedResourceMetadata(authInstance(c.env) as Parameters<typeof oAuthProtectedResourceMetadata>[0])(c.req.raw));
  }

  // An UNAUTHENTICATED POST to /api/mcp gets a 401 + RFC-9728 WWW-Authenticate pointing at the protected-resource
  // metadata, so the MCP client knows to start the OAuth flow. A resolved caller (`user` set upstream by auth's
  // identity/apiKeyAuth/mcpBearerAuth) skips this; OPTIONS/GET (mcpApp's preflight/405) pass through. It runs BEFORE
  // mcpApp's POST handler because it's registered on the same path first.
  app.on("POST", BASE_PATH, async (c, next) => {
    if ((c.var as { user?: unknown }).user) return next();
    const rm = `${new URL(c.req.url).origin}/.well-known/oauth-protected-resource`;
    return c.body(null, 401, { "www-authenticate": `Bearer resource_metadata="${rm}"` });
  });

  // (1) the MCP JSON-RPC server, per-caller scope-projected. mcpApp registers its handler AT `basePath`, so mount at "/"
  //     (not "/api/mcp") to avoid double-prefixing. `exec: appExec(app)` reads the host app lazily at call time, so
  //     mounting on `app` here (before returning it) is fine. Cast `app` to FetchApp — appExec only needs `.fetch`.
  app.route(
    "/",
    mcpApp({
      document: (c: Context) => opts.apiDocument({ scopes: (c.var as { scopes?: string[] }).scopes ?? [] }),
      exec: appExec(app as unknown as FetchApp),
      include: "all",
      name: "suluk",
      version: "0.1.0",
      basePath: BASE_PATH,
    }),
  );

  return app;
}
