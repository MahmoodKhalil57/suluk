/** The `mcp` module's CONTRACT fragment — its session-only `/api/mcp/connections/*` management ops. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

export const mcpOps = [
  { method: "get", path: "/api/mcp/connections", name: "listMcpConnections", summary: "The caller's MCP OAuth connections (per-client config). Session-only.", tags: ["MCP"], responses: [{ status: 200, description: "The MCP connections." }] },
  { method: "post", path: "/api/mcp/connections/update", name: "updateMcpConnection", summary: "Update an MCP connection's config. Session-only.", tags: ["MCP"], responses: [{ status: 200, description: "The connection was updated." }] },
  { method: "post", path: "/api/mcp/connections/revoke", name: "revokeMcpConnection", summary: "Revoke an MCP connection (drops its tokens). Session-only.", tags: ["MCP"], responses: [{ status: 200, description: "The connection was revoked." }] },
] satisfies readonly RouteContract[];
