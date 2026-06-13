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
  /**
   * TIER-TRIM (C027 tier-trim serving) — the names of the RESIDENT tools. When set, `tools/list` serves only those
   * plus a synthetic `discover_tools` meta-tool; the COLD-TAIL (every other tool) is withheld from the default
   * surface and revealed on demand when the model calls `discover_tools`. `tools/call` still executes ANY tool by
   * name (cold-tail tools are servable, just not advertised up front) — so the context reduction is real, lossless,
   * and self-healing. Absent ⇒ the full surface is served (no trim).
   */
  resident?: Set<string>;
}

/** The synthetic meta-tool that reveals the cold-tail. It is NEVER routed to `exec` — handled in `tools/call`. */
export const DISCOVER_TOOL = {
  name: "discover_tools",
  description:
    "Reveal additional specialized tools available on demand beyond the resident set shown in tools/list. Call this " +
    "with an optional `intent` (free text describing what you are trying to do) to filter to the most relevant ones. " +
    "Any revealed tool can then be called directly by its name.",
  inputSchema: {
    type: "object",
    properties: { intent: { type: "string", description: "what you are trying to do — filters the cold-tail tools (omit to list all)" } },
  },
} as const;

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
    case "tools/list": {
      // Tier-trim: serve resident tools + the discover_tools meta-tool (only if a cold-tail actually exists).
      const listed = ctx.resident ? ctx.tools.filter((t) => ctx.resident!.has(t.name)) : ctx.tools;
      const out = listed.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }));
      if (ctx.resident && ctx.tools.some((t) => !ctx.resident!.has(t.name))) out.push(DISCOVER_TOOL as unknown as (typeof out)[number]);
      return ok(msg.id, { tools: out });
    }
    case "tools/call": {
      const name = msg.params?.name;
      const args = (msg.params?.arguments as Record<string, unknown> | undefined) ?? {};
      if (typeof name !== "string") return err(msg.id, -32602, "Invalid params: 'name' is required");
      // The discover_tools meta-tool reveals the cold-tail (never routed to exec). Only active under tier-trim.
      if (name === DISCOVER_TOOL.name && ctx.resident) {
        const intent = typeof args.intent === "string" ? args.intent.toLowerCase().trim() : "";
        const coldTail = ctx.tools.filter((t) => !ctx.resident!.has(t.name));
        const matched = intent ? coldTail.filter((t) => `${t.name} ${t.description ?? ""}`.toLowerCase().includes(intent)) : coldTail;
        const revealed = matched.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }));
        const text = revealed.length
          ? `Discovered ${revealed.length} additional tool(s)${intent ? ` for "${args.intent}"` : ""}: ${revealed.map((t) => t.name).join(", ")}. Call any by name.`
          : `No additional tools matched${intent ? ` "${args.intent}"` : ""}.`;
        return ok(msg.id, { content: [{ type: "text", text }], structuredContent: { tools: revealed } });
      }
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
