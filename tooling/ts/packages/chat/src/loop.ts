/**
 * loop.ts — the tool-use agent loop, PURE (the model call + tool exec are injected). Each step: ask the model
 * (streaming its text out via events); if it returned tool calls, execute each through the host `exec` (which runs
 * the operation through the store's own access gate — so "act" is exactly as authorized as a direct API call),
 * append the results, and loop; otherwise finish. Bounded by `maxSteps`. Tool results are truncated so one chatty
 * list can't blow the context (or the bill).
 */
import type { McpTool, McpOp } from "@suluk/mcp";
import { toolsToOpenAI, type ChatMessage, type OpenAITool } from "./openrouter";

/** A browser-executed tool: the model can call it, but the WORKER never runs it — it streams a `client_tool` event
 *  to the widget, which executes the action (cart, theme, navigation, …) locally. Defs only (no handler) reach the
 *  server. Reads should come from the per-turn client-state snapshot, not these (which return only a generic ack). */
export interface ClientToolDef { name: string; description: string; parameters: object }

export type AgentEvent =
  | { type: "step"; n: number }
  | { type: "text"; delta: string }
  | { type: "tool"; phase: "start" | "end"; name: string; ok?: boolean }
  | { type: "client_tool"; name: string; args: Record<string, unknown> }
  | { type: "done"; reason: "stop" | "max-steps" }
  | { type: "error"; message: string };

export interface RunAgentOptions {
  /** Conversation so far (user/assistant turns); the system prompt is prepended from `system`. */
  messages: ChatMessage[];
  tools: McpTool[];
  /** Browser-executed tool definitions (no handler) — surfaced to the model, dispatched to the widget by name. */
  clientTools?: ClientToolDef[];
  /** Execute a SERVER tool call against the store (e.g. appExec bound to the request). */
  exec: (op: McpOp, args: Record<string, unknown>) => Promise<unknown>;
  /** One streamed model completion: stream text via onText, resolve to the final assistant message. */
  complete: (messages: ChatMessage[], tools: OpenAITool[], onText: (d: string) => void | Promise<void>) => Promise<ChatMessage>;
  system?: string;
  /** max model round-trips before forcing a stop (default 6). */
  maxSteps?: number;
  /** cap each tool result's serialized length fed back to the model (default 8000 chars). */
  maxResultChars?: number;
}

export async function runAgent(o: RunAgentOptions, onEvent: (e: AgentEvent) => void | Promise<void>): Promise<ChatMessage[]> {
  const clientDefs = o.clientTools ?? [];
  const oaTools: OpenAITool[] = [...toolsToOpenAI(o.tools), ...clientDefs.map((t) => ({ type: "function" as const, function: { name: t.name, description: t.description, parameters: t.parameters } }))];
  const cap = o.maxResultChars ?? 8000;
  const maxSteps = o.maxSteps ?? 6;
  const byName = new Map(o.tools.map((t) => [t.name, t]));
  const clientNames = new Set(clientDefs.map((t) => t.name));
  const msgs: ChatMessage[] = [...(o.system ? [{ role: "system" as const, content: o.system }] : []), ...o.messages];

  for (let step = 0; step < maxSteps; step++) {
    await onEvent({ type: "step", n: step + 1 });
    const assistant = await o.complete(msgs, oaTools, (d) => onEvent({ type: "text", delta: d }));
    msgs.push(assistant);

    if (!assistant.tool_calls?.length) { await onEvent({ type: "done", reason: "stop" }); return msgs; }

    for (const call of assistant.tool_calls) {
      const name = call.function.name;
      let args: Record<string, unknown> = {};
      let argErr = false;
      if (call.function.arguments) { try { args = JSON.parse(call.function.arguments); } catch { argErr = true; } }

      // CLIENT tool → never executed server-side: stream it to the widget + feed the model a generic ack so the loop
      // can continue (reads come from the client-state snapshot, not from these).
      if (clientNames.has(name)) {
        if (!argErr) await onEvent({ type: "client_tool", name, args });
        msgs.push({ role: "tool", tool_call_id: call.id, name, content: argErr ? "Error: the tool arguments were not valid JSON." : "Acknowledged — this action was performed in the user's browser." });
        continue;
      }

      await onEvent({ type: "tool", phase: "start", name });
      let resultStr: string, ok = true;
      try {
        const tool = byName.get(name);
        if (!tool) throw new Error(`unknown tool: ${name}`);
        if (argErr) throw new Error("the tool arguments were not valid JSON");
        const data = await o.exec(tool.op, args);
        resultStr = typeof data === "string" ? data : JSON.stringify(data);
        if (resultStr.length > cap) resultStr = resultStr.slice(0, cap) + "\n…(truncated)";
      } catch (e) { ok = false; resultStr = `Error: ${(e as Error).message}`; }
      msgs.push({ role: "tool", tool_call_id: call.id, name, content: resultStr });
      await onEvent({ type: "tool", phase: "end", name, ok });
    }
  }
  await onEvent({ type: "done", reason: "max-steps" });
  return msgs;
}
