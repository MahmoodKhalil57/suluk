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
import { mcpApp, appExec, type FetchApp } from "@suluk/mcp";
import { oAuthDiscoveryMetadata, oAuthProtectedResourceMetadata } from "better-auth/plugins";
import type { Bindings } from "../app";
import { createAuth, type AuthEnv } from "../auth";
import { apiDocument } from "../contract";
import { mcpConnectionsRoutes } from "./mcp-connections";

const BASE_PATH = "/api/mcp";

export function mountMcp<T extends Hono<{ Bindings: Bindings }>>(app: T): T {
  // (3) connections management — registered BEFORE mcpApp so `/api/mcp/connections*` isn't swallowed by the JSON-RPC route.
  app.route(BASE_PATH, mcpConnectionsRoutes());

  // (2) OAuth discovery at the ROOT origin (where MCP clients probe). Both plugin helpers take the auth instance and
  //     return a `(Request) => Promise<Response>`; feed them the raw request. Requires `auth`'s mcp plugin enabled.
  app.get("/.well-known/oauth-authorization-server", (c) =>
    oAuthDiscoveryMetadata(createAuth(c.env as unknown as AuthEnv))(c.req.raw),
  );
  app.get("/.well-known/oauth-protected-resource", (c) =>
    oAuthProtectedResourceMetadata(createAuth(c.env as unknown as AuthEnv))(c.req.raw),
  );

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
      document: (c: Context) => apiDocument({ scopes: (c.var as { scopes?: string[] }).scopes ?? [] }),
      exec: appExec(app as unknown as FetchApp),
      include: "all",
      name: "suluk",
      version: "0.1.0",
      basePath: BASE_PATH,
    }),
  );

  return app;
}
