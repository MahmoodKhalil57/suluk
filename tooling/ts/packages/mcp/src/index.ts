/**
 * @suluk/mcp — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
 * the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
 * (read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
 * as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
 * Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
 * CANDIDATE tooling — NOT official OAS.
 */
export { toolsFrom, type McpTool, type McpOp, type ToolsOptions } from "./tools";
export { handleRpc, LATEST_PROTOCOL, SUPPORTED_PROTOCOLS, type RpcRequest, type RpcResponse, type RpcContext, type ToolExec } from "./protocol";
export { buildRequest, originExec, appExec, type FetchApp } from "./exec";
export { mcpApp, type McpOptions } from "./app";
