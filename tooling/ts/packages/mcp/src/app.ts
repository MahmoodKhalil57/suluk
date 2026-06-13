/**
 * app.ts — mount a contract-projected MCP server at `basePath` (default `/mcp`) over the Streamable-HTTP transport.
 * POST carries JSON-RPC (single message or a batch); we always answer with `application/json` (this server initiates
 * no server→client stream, so GET returns 405, which is conformant). Tools are projected from the document on each
 * request, so a per-request (per-role) `document` function yields a per-role tool set for free. Read-only by default.
 */
import { Hono, type Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { OpenAPIv4Document } from "@suluk/core";
import { toolsFrom, type ToolsOptions, type McpOp } from "./tools";
import { handleRpc, type RpcRequest } from "./protocol";
import { originExec } from "./exec";

/** Max JSON-RPC request body. MCP messages are tiny; this bounds a hostile oversized POST before it is parsed. */
const MAX_BODY = 256 * 1024;

export interface McpOptions extends ToolsOptions {
  /** The v4 document — a value, or a per-request function (e.g. return projectDocument(doc, roleOf(c))). */
  document: OpenAPIv4Document | ((c: Context) => OpenAPIv4Document | Promise<OpenAPIv4Document>);
  basePath?: string;
  /** Advertised server identity. */
  name?: string;
  version?: string;
  /** Free-text guidance surfaced to the model on `initialize`. */
  instructions?: string;
  /** Gate the whole endpoint — return true to allow. Default: open (read-only catalog browsing). */
  authorize?: (c: Context) => boolean | Promise<boolean>;
  /** Override how a tool call is executed (default: same-origin fetch via {@link originExec}). */
  exec?: (c: Context, op: McpOp, args: Record<string, unknown>) => Promise<unknown>;
  /** Send permissive CORS so browser-based MCP clients can reach a public read-only server (default: true). */
  cors?: boolean;
  /**
   * TIER-TRIM serving (C027): the names of the RESIDENT tools (a value or a per-request resolver). When provided,
   * `tools/list` serves only these + a `discover_tools` meta-tool, withholding the cold-tail from the default surface
   * (revealed on demand) — the real, lossless context reduction the agent layer promises. Derive these from an
   * agent's route tiers, e.g. `@suluk/agents` `residentToolNames(doc, agentName)`. Absent ⇒ the full surface is served.
   */
  resident?: string[] | ((c: Context) => string[] | undefined | Promise<string[] | undefined>);
}

const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type, mcp-protocol-version, mcp-session-id, authorization" };

export function mcpApp(opts: McpOptions): Hono {
  const base = (opts.basePath ?? "/mcp").replace(/\/$/, "");
  const info = { name: opts.name ?? "suluk-mcp", version: opts.version ?? "0.1.0" };
  const authorize = opts.authorize ?? (() => true);
  const cors = opts.cors !== false ? CORS : {};
  const app = new Hono();

  async function docFor(c: Context): Promise<OpenAPIv4Document> {
    return typeof opts.document === "function" ? await opts.document(c) : opts.document;
  }

  app.options(base, (c) => c.body(null, 204, cors));

  app.get(base, (c) => c.json({ jsonrpc: "2.0", id: null, error: { code: -32000, message: "This MCP endpoint does not offer a server→client stream; POST JSON-RPC instead." } }, 405, { ...cors, allow: "POST, OPTIONS" }));

  const tooBig = (c: Context) => c.json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Request body too large" } }, 413, cors);
  app.post(base, bodyLimit({ maxSize: MAX_BODY, onError: tooBig }), async (c) => {
    if (!(await authorize(c))) return c.json({ jsonrpc: "2.0", id: null, error: { code: -32001, message: "Unauthorized" } }, 401, cors);

    let payload: unknown;
    try { payload = await c.req.json(); } catch { return c.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400, cors); }

    // MCP 2025-06-18 REMOVED JSON-RPC batching (one message per POST). Reject arrays up front — this also closes the
    // batch→N-subrequest self-amplification vector (each tools/call would otherwise fan out into an origin fetch).
    if (Array.isArray(payload)) return c.json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request: JSON-RPC batching was removed in MCP 2025-06-18 — send one message per request" } }, 400, cors);

    const doc = await docFor(c);
    const tools = toolsFrom(doc, opts);
    const exec = opts.exec ? (op: McpOp, args: Record<string, unknown>) => opts.exec!(c, op, args) : (op: McpOp, args: Record<string, unknown>) => originExec(c, op, args);
    const residentList = typeof opts.resident === "function" ? await opts.resident(c) : opts.resident;
    const resident = residentList && residentList.length ? new Set(residentList) : undefined;

    const response = await handleRpc(payload as RpcRequest, { tools, info, exec, protocolVersion: undefined, instructions: opts.instructions, resident });
    if (response === null) return c.body(null, 202, cors); // a notification → accepted, no body
    return c.json(response, 200, cors);
  });

  return app;
}
