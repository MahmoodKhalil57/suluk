/**
 * openrouter.ts — a thin OpenAI-compatible chat client for OpenRouter, with streaming + tool-call accumulation.
 * No SDK: just `fetch` + an SSE parser, so it runs unchanged on Cloudflare Workers / Bun / Node. The model id is NOT
 * chosen here (that's @suluk/models' job) — this only speaks the wire protocol. Tool schemas come from @suluk/mcp.
 */
import type { McpTool } from "@suluk/mcp";

export interface ToolCall { id: string; type: "function"; function: { name: string; arguments: string } }
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  /** assistant turns that call tools */
  tool_calls?: ToolCall[];
  /** tool-result turns reference the call they answer */
  tool_call_id?: string;
  name?: string;
}
export interface OpenAITool { type: "function"; function: { name: string; description: string; parameters: object } }

export interface OpenRouterConfig {
  apiKey: string;
  /** default https://openrouter.ai/api/v1 */
  baseUrl?: string;
  /** OpenRouter ranking attribution (optional). */
  referer?: string;
  title?: string;
  temperature?: number;
}

/** Map @suluk/mcp tool descriptors to OpenAI/OpenRouter `tools` (function-calling) shape. */
export function toolsToOpenAI(tools: McpTool[]): OpenAITool[] {
  return tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.inputSchema } }));
}

/**
 * One streamed chat completion. Forwards assistant text deltas to `onText` as they arrive and returns the FINAL
 * assistant message (with any accumulated `tool_calls`). Throws on a non-2xx (the loop reports it to the client).
 */
export async function streamCompletion(
  cfg: OpenRouterConfig,
  model: string,
  messages: ChatMessage[],
  tools: OpenAITool[],
  onText: (delta: string) => void | Promise<void>,
  signal?: AbortSignal,
): Promise<ChatMessage> {
  const res = await fetch((cfg.baseUrl ?? "https://openrouter.ai/api/v1").replace(/\/$/, "") + "/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cfg.apiKey}`,
      ...(cfg.referer ? { "HTTP-Referer": cfg.referer } : {}),
      ...(cfg.title ? { "X-Title": cfg.title } : {}),
    },
    body: JSON.stringify({ model, messages, ...(tools.length ? { tools } : {}), stream: true, ...(cfg.temperature != null ? { temperature: cfg.temperature } : {}) }),
    signal,
  });
  if (!res.ok || !res.body) { const t = await res.text().catch(() => ""); throw new Error(`OpenRouter ${res.status}${t ? `: ${t.slice(0, 300)}` : ""}`); }
  return parseSSEStream(res.body, onText);
}

/** Parse an OpenAI-style SSE completion stream: forward `delta.content`, accumulate `delta.tool_calls` by index. */
export async function parseSSEStream(body: ReadableStream<Uint8Array>, onText: (delta: string) => void | Promise<void>): Promise<ChatMessage> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "", content = "";
  const calls = new Map<number, { id: string; name: string; args: string }>();
  let done = false;
  while (!done) {
    const { done: rdone, value } = await reader.read();
    if (rdone) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") { done = true; break; }
      let chunk: { choices?: { delta?: { content?: string | null; tool_calls?: { index?: number; id?: string; function?: { name?: string; arguments?: string } }[] } }[] };
      try { chunk = JSON.parse(data); } catch { continue; }
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;
      if (typeof delta.content === "string" && delta.content) { content += delta.content; await onText(delta.content); }
      for (const tc of delta.tool_calls ?? []) {
        const idx = tc.index ?? 0;
        const cur = calls.get(idx) ?? { id: "", name: "", args: "" };
        if (tc.id) cur.id = tc.id;
        if (tc.function?.name) cur.name = tc.function.name;
        if (tc.function?.arguments) cur.args += tc.function.arguments;
        calls.set(idx, cur);
      }
    }
  }
  const tool_calls = [...calls.values()].filter((c) => c.name).map((c) => ({ id: c.id || c.name, type: "function" as const, function: { name: c.name, arguments: c.args || "{}" } }));
  return { role: "assistant", content: content || null, ...(tool_calls.length ? { tool_calls } : {}) };
}
