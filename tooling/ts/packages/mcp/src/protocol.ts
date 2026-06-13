/**
 * protocol.ts — the MCP JSON-RPC 2.0 method surface, PURE (transport injected via `exec`). Implements the minimal
 * conformant request/response subset of the 2025-06-18 "Streamable HTTP" spec: `initialize`, `tools/list`,
 * `tools/call`, `ping`, and notification swallowing. Tool failures are reported IN-BAND (`isError: true`) — only
 * malformed requests / unknown methods become JSON-RPC protocol errors, exactly as the spec prescribes.
 */
import type { McpOp, McpTool } from "./tools";

export const LATEST_PROTOCOL = "2025-06-18";
export const SUPPORTED_PROTOCOLS = new Set(["2024-11-05", "2025-03-26", "2025-06-18"]);

export interface RpcRequest { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> }
export interface RpcResponse { jsonrpc: "2.0"; id: string | number | null; result?: unknown; error?: { code: number; message: string; data?: unknown } }

export type ToolExec = (op: McpOp, args: Record<string, unknown>) => Promise<unknown>;

export interface RpcContext {
  tools: McpTool[];
  info: { name: string; version: string };
  exec: ToolExec;
  /** Server's preferred protocol version (echoed back only if the client didn't pin a supported one). */
  protocolVersion?: string;
  /** Optional free-text usage guidance surfaced to the model on `initialize`. */
  instructions?: string;
}

const err = (id: RpcRequest["id"], code: number, message: string, data?: unknown): RpcResponse =>
  ({ jsonrpc: "2.0", id: id ?? null, error: { code, message, ...(data !== undefined ? { data } : {}) } });
const ok = (id: RpcRequest["id"], result: unknown): RpcResponse => ({ jsonrpc: "2.0", id: id ?? null, result });

/** Dispatch one JSON-RPC message. Returns `null` ONLY for a notification — a message with no `id` MEMBER; the caller
 *  then emits no body. Anything carrying an `id` (even the discouraged `id: null`) always gets a correlated response. */
export async function handleRpc(msg: RpcRequest, ctx: RpcContext): Promise<RpcResponse | null> {
  if (msg === null || typeof msg !== "object" || Array.isArray(msg)) return err(null, -32600, "Invalid Request");
  const method = msg.method;
  const isNotification = !("id" in msg); // notification = NO id member; `id:null` is a (discouraged) request id, not this
  if (typeof method !== "string") return isNotification ? null : err(msg.id, -32600, "Invalid Request: missing method");

  // Notifications (e.g. notifications/initialized, notifications/cancelled) get no response.
  if (method.startsWith("notifications/")) return null;

  switch (method) {
    case "initialize": {
      const wanted = (msg.params?.protocolVersion as string | undefined);
      const protocolVersion = wanted && SUPPORTED_PROTOCOLS.has(wanted) ? wanted : (ctx.protocolVersion ?? LATEST_PROTOCOL);
      return ok(msg.id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: ctx.info,
        ...(ctx.instructions ? { instructions: ctx.instructions } : {}),
      });
    }
    case "ping":
      return ok(msg.id, {});
    case "tools/list":
      return ok(msg.id, { tools: ctx.tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) });
    case "tools/call": {
      const name = msg.params?.name;
      const args = (msg.params?.arguments as Record<string, unknown> | undefined) ?? {};
      if (typeof name !== "string") return err(msg.id, -32602, "Invalid params: 'name' is required");
      const tool = ctx.tools.find((t) => t.name === name);
      if (!tool) return err(msg.id, -32602, `Unknown tool: ${name}`);
      try {
        const data = await ctx.exec(tool.op, args);
        const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
        const structured = data !== null && typeof data === "object" ? { structuredContent: data as Record<string, unknown> } : {};
        return ok(msg.id, { content: [{ type: "text", text }], ...structured });
      } catch (e) {
        // Execution failures are TOOL results, not protocol errors (spec §Tools/Error handling).
        return ok(msg.id, { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true });
      }
    }
    default:
      return isNotification ? null : err(msg.id, -32601, `Method not found: ${method}`);
  }
}
