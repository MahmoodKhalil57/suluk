[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [Registry](../../Registry.md) / [Surfaces](../Surfaces.md) / mcp

# MCP server — API-as-MCP over the derived contract + OAuth

A middleware mount that turns your ONE v4 contract into an agent-callable MCP surface at `/api/mcp` — each caller sees only the tools its principal can call, the OAuth discovery is served for you, and per-connection knobs (cap / rate-share / kill-switch) live in a table you own. You own the wiring; the protocol + the OAuth server flow from npm.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/mcp
# or:  npx shadcn@latest add MahmoodKhalil57/suluk/mcp
# pin to a ref:  MahmoodKhalil57/suluk/mcp#main
```

`registryDependencies` (here, `app`, `auth`, `contract`) are pulled in automatically, and the npm `dependencies` are installed. The files land in your app; the `@suluk/mcp` logic comes down as an npm package.

## What you get

Five files drop into your app — all yours to edit:

- **`src/routes/mcp.ts`** (from `mcp.routes.ts`) — `mountMcp(app)`, the middleware mount that wires three things onto your Hono app:
  1. **The MCP JSON-RPC server** — `@suluk/mcp`'s `mcpApp`, per-caller scope-projected. Its `document` is a per-request `apiDocument({ scopes })` off the caller's principal, so `tools/list` shows only the tools this caller can call (the contract-first payoff — no hand-maintained tool list). `exec: appExec(app)` dispatches each tool call **in-process** through the same app (not a self-fetch to the public origin), so the inner request re-enters `/api/*` identity-resolved and scope-gated identically. `include: "all"` exposes mutations as tools too, each still gated per-caller.
  2. **The OAuth 2.1 discovery documents** at the root origin — `GET /.well-known/oauth-authorization-server` + `GET /.well-known/oauth-protected-resource`, re-exposing Better Auth's `mcp()` plugin helpers where MCP clients actually probe. An unauthenticated `POST /api/mcp` returns `401` + an RFC-9728 `WWW-Authenticate` pointing at the protected-resource metadata, so the client knows to start the OAuth flow.
  3. **The connections management routes** (`mcpConnectionsRoutes`), registered **before** `mcpApp` so `/api/mcp/connections*` isn't swallowed by the JSON-RPC handler.

  Place `mountMcp` **after** `auth` (so the bearer/session/api-key caller is resolved) and **after** `contract` (the scope gate) in your manifest.
- **`src/services/mcp.ts`** (from `mcp.connections.service.ts`) — the `McpConnections` Effect service (`Context.Tag` + `McpConnectionsLive` `Layer`) over the owned `mcp_connection` table. It depends on the `Db` service from `app` and exposes `list(userId)`, `update(userId, clientId, patch)` (partial-safe — an omitted knob is preserved, never recomputed to null, so a share-only edit can't silently clear a set paid cap), and `revoke(userId, clientId)`. Compose it with `Layer.provide(McpConnectionsLive, DbLive(env))`. Each connection's attributed-spend id is `mcpConnectionKeyId(userId, clientId)` (from `auth`).
- **`src/routes/mcp-connections.ts`** (from `mcp.connections.routes.ts`) — `mcpConnectionsRoutes()`, a Hono router over the `McpConnections` service. These are **session-only**: only a signed-in user manages the knobs, so a keyed caller (an api-key / MCP bearer) is denied `403` (a connection must never widen its own cap). Mounted by `mountMcp` under `/api/mcp`:
  - `GET /api/mcp/connections` → `{ connections }` — the caller's knob-rows (cap / rate-share / disabled), newest first
  - `POST /api/mcp/connections/update` `{ clientId, creditCap?, rateSharePct?, disabled? }` — upsert one connection's knobs (partial-safe)
  - `POST /api/mcp/connections/revoke` `{ clientId }` — delete a connection's knob row
- **`src/db/mcp.ts`** (from `mcp.schema.ts`) — the owned `mcpConnection` Drizzle table (`mcp_connection`): one user's knobs on one OAuth connection they authorized, composite PK `(userId, clientId)`, all knob columns nullable (absent ⇒ no cap / full share / enabled). Your drizzle config + migrations import from here.
- **`provision/mcp.ts`** (from `mcp.provision.ts`) — `mcpProvision`, an `@suluk/provision` `InstanceSpec[]` fragment. It declares the shared app D1 (`ref: "db"`, `protected: true`) plus the `0007_mcp` migration that creates `mcp_connection`. A platform merges every module's fragment into one `provision.config.ts`; because the `ref` is `"db"`, mcp/auth/credits all add their migrations to the SAME database.

## Dependencies

**npm (`dependencies`):**

- [`@suluk/mcp`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/tooling/ts/packages/mcp) — the MCP protocol + per-caller tool projection (see below)
- [`@suluk/provision`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/tooling/ts/packages/provision) — the `InstanceSpec` type + `plan`/`apply`
- `better-auth` — the `mcp()` plugin's OAuth discovery helpers (`oAuthDiscoveryMetadata` / `oAuthProtectedResourceMetadata`)
- `effect` — the service/`Layer` runtime
- `drizzle-orm` — the schema + queries
- `hono` — the router + the mount

**Registry (`registryDependencies`):**

- `MahmoodKhalil57/suluk/app` — the base Hono app, `Bindings`, and the Effect `Db` service the layer + routes depend on
- `MahmoodKhalil57/suluk/auth` — `createAuth` + the resolved caller (`user` / `keyId` / `scopes`), the `mcpConnectionKeyId` id, and the Better Auth `mcp()` plugin whose OAuth issuance this sidecars
- `MahmoodKhalil57/suluk/contract` — `apiDocument({ scopes })`, the per-caller scope-projected document that becomes the tool list

## Own the wiring, npm the logic

This is the HYBRID pattern (ADR [C050](https://github.com/MahmoodKhalil57/suluk/blob/main/registry/doc/architecture/decisions/C050-registry-distributed-framework.md)/[C052](https://github.com/MahmoodKhalil57/suluk/blob/main/registry/doc/architecture/decisions/C052-npm-vs-registry-boundary.md)): you **own** the seam, and **npm** the protocol + the OAuth server.

- **You own** the mount (`mountMcp` — the mount order, the OAuth-discovery re-export, the `401` challenge), the connections Effect service + routes, the `mcp_connection` schema, and the provision fragment. Edit them freely — change the base path, adjust the knobs, wire the FK to your `user` table, tune the session-only policy.
- **`@suluk/mcp` owns** the protocol correctness, so its fixes flow to you via npm instead of forking into your app:
  - `mcpApp` — the Hono-mountable MCP JSON-RPC server (Streamable-HTTP transport: `initialize` / `tools/list` / `tools/call` / `ping`); a contract document projects straight into the tool set, no hand-written tool schemas.
  - `appExec` — the in-process `exec` seam that rebuilds a tool call into a same-origin request against your own routes (SSRF-safe: a caller influences argument VALUES, never the scheme/host/route), so tool dispatch re-enters `/api/*` identically identity-resolved and scope-gated.
- **Better Auth owns** the OAuth 2.1 server itself — issuance (authorize / token / consent) and the `oauthApplication` / `oauthAccessToken` / `oauthConsent` tables live in the `mcp()` plugin (via `auth`); this module re-exposes only its discovery helpers and owns only the per-connection sidecar knobs.

A correctness fix in the protocol or the OAuth server reaches every consumer as a version bump; a forked auth path never happens.
