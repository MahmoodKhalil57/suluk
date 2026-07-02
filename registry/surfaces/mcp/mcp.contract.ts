/** The `mcp` module's CONTRACT fragment — its session-only `/api/mcp/connections/*` management ops. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";
import { z } from "zod";

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
    tags: ["MCP"],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    errors: [400, 401, 403],
    request: { json: z.object({ clientId: z.string().min(1) }) },
    responses: [{ status: 200, description: "The connection was revoked.", schema: OkSchema }],
  },
] satisfies readonly RouteContract[];
