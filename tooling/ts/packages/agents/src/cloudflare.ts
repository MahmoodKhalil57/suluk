/**
 * projectCloudflareAgent (C027, Stage 2.A) — the THIRD projection target alongside projectClaudePlugin /
 * projectOpenRouter: one `x-suluk-agents` declaration → an OWNED Cloudflare Agents-SDK scaffold (the runtime that
 * actually executes the agent on Durable Objects). It emits exactly the WIRING the Stage-0 measurement proved
 * derivable (~71%): the Agent subclass, the worker `routeAgentRequest` entry, the Env bindings, and the tool
 * definitions (name + description + input schema, derived from each route's operation; + the `needsApproval` gate
 * from the new `x-suluk-approval` facet). The BESPOKE brain — the loop policy, the system-prompt bytes, and each
 * tool's `execute` body — is left as clearly-marked TODOs, because the measurement showed it is irreducibly the
 * author's (generating it would be over-abstraction).
 *
 * L3 LINE (C023): this RENDERS owned source the user controls — it never hosts, opens a socket, fetches a preprompt,
 * or holds a credential. The emitted file IMPORTS `agents`/`ai` (the user's deps), but THIS package takes no such
 * dependency: it returns source STRINGS, exactly as projectClaudePlugin returns a plugin.json that names Claude
 * without importing it. Determinism is DECLARED here, never enforced — the matcher still never reads an agent field.
 *
 * It also returns the `durableObjects` descriptor to feed `@suluk/deploy` / `@suluk/cloudflare` (Stage 1.1/1.2),
 * closing the loop: the same contract that scaffolds the agent also declares the DO binding + sqlite migration.
 */
import type { OpenAPIv4Document, SulukSkillRef, SchemaOrRef } from "@suluk/core";
import { agentMap, resolveOperationRef } from "./resolve";
import { reachableSurface, residentSurface } from "./conformance";
import { assertAgentInstallable } from "./lint";
import { contentHash } from "./skill";

export interface CloudflareAgentOptions {
  /** the Durable Object class + binding name (default: PascalCase of the agent name). */
  className?: string;
  /** instruction snapshots per skill name — the primary skill's text is inlined (pinned) as the system prompt. */
  instructions?: Record<string, string>;
  /** an MCP endpoint the tool `execute` stubs can dispatch to — referenced in a comment, never embedded as a credential. */
  mcpUrl?: string;
}

export interface CloudflareAgentArtifacts {
  /** path → owned source the user writes into their Worker project. */
  files: Record<string, string>;
  /** feed this to `@suluk/deploy`'s `durableObjects` / `@suluk/cloudflare`'s `DeployPlan.durableObjects` (Stage 1.1/1.2). */
  durableObjects: { binding: string; className: string }[];
  /** reachable sub-agents — each is its own Durable Object; scaffold them separately (v1 emits the named agent only). */
  reachableSubAgents: string[];
}

/** PascalCase a wire id (e.g. "weatherAssistant" → "WeatherAssistant", "conin-retrieval" → "ConinRetrieval"). */
function pascal(s: string): string {
  const t = s.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/[^a-zA-Z0-9]/g, "");
  return (t.charAt(0).toUpperCase() + t.slice(1)) || "Agent";
}

/** The first skill that declares a model — the agent's primary LLM tier (mirrors project.ts). */
function primarySkill(skills?: Record<string, SulukSkillRef>): [string, SulukSkillRef] | null {
  for (const [k, s] of Object.entries(skills ?? {})) if (s.model && s.model.length) return [k, s];
  return Object.entries(skills ?? {})[0] ?? null;
}

/** Indent a multi-line block by `n` spaces (for nesting a JSON-schema literal inside a tool definition). */
const indent = (s: string, n: number) => s.split("\n").map((l, i) => (i === 0 ? l : " ".repeat(n) + l)).join("\n");

/** One tool literal, derived from a route's operation: name + description + input schema (+ approval gate + stub). */
function toolLiteral(doc: OpenAPIv4Document, routeKey: string, operationRef: string, mcpUrl?: string): string {
  const req = resolveOperationRef(doc, operationRef)?.request; // installable ⇒ non-null
  // a TRIMMED-empty summary must fall through (lint allows an empty summary; the LLM routes on this description).
  const description = (req?.summary?.trim() || req?.description?.trim() || `route ${routeKey}`).replace(/\n/g, " ");
  const schema: SchemaOrRef = (req?.contentSchema ?? req?.parameterSchema?.body ?? { type: "object" }) as SchemaOrRef;
  const approval = req?.["x-suluk-approval"];
  const approvalLine = approval?.required
    ? `\n    needsApproval: async () => true, // x-suluk-approval${approval.reason ? `: ${approval.reason.replace(/\n/g, " ")}` : ""} — replace with your gate`
    : "";
  const dispatch = mcpUrl ? `call your API, or POST to the MCP endpoint ${mcpUrl}` : "call your API (or your MCP endpoint)";
  return `  ${routeKey}: tool({
    description: ${JSON.stringify(description)},
    inputSchema: jsonSchema(${indent(JSON.stringify(schema, null, 2), 4)}),${approvalLine}
    // TODO (yours): perform the operation — ${dispatch}.
    execute: async (input) => { throw new Error("TODO: implement ${routeKey} → ${operationRef}"); },
  }),`;
}

function toolsConst(doc: OpenAPIv4Document, name: string, keys: string[], routes: Record<string, { operationRef: string }>, mcpUrl?: string): string {
  if (!keys.length) return `export const ${name} = {};\n`;
  const body = keys.map((k) => toolLiteral(doc, k, routes[k]!.operationRef, mcpUrl)).join("\n");
  return `export const ${name} = {\n${body}\n};\n`;
}

function agentFile(doc: OpenAPIv4Document, agentName: string, className: string, opts: CloudflareAgentOptions): string {
  const agent = agentMap(doc)[agentName]!;
  const routes = (agent.routes ?? {}) as Record<string, { operationRef: string; tier?: string }>;
  const resident = residentSurface(doc, agentName);                       // this agent's own non-cold-tail routes
  const coldTail = Object.keys(routes).filter((k) => routes[k]!.tier === "cold-tail");
  const [primName, primSkill] = primarySkill(agent.skills) ?? [undefined, undefined as SulukSkillRef | undefined];
  const model = primSkill?.model?.[0];
  const snapshot = primName ? opts.instructions?.[primName] : undefined;
  const system = snapshot !== undefined
    ? `${JSON.stringify(snapshot)}, // pinned from skill "${primName}" (contentHash ${contentHash(snapshot)})`
    : `"TODO: your system prompt", // pin from ${primSkill?.provenance?.source ?? `skill "${primName ?? "—"}"`}`;
  const subAgents = Object.entries(agent.agents ?? {}).map(([local, r]) => `${local} → ${pascal((r.ref.split("/").pop() ?? local))}`);

  return `// CANDIDATE — generated by @suluk/agents projectCloudflareAgent. OWNED SOURCE you complete.
// DERIVED from the contract: the class wiring, the Env bindings, and the tool name/description/inputSchema (+ approval gates).
// YOURS to fill: the model choice, the system prompt, the loop policy (stopWhen), and every tool's \`execute\` body.
${subAgents.length ? `// sub-agents (each is its own Durable Object — scaffold separately): ${subAgents.join(", ")}\n` : ""}import { AIChatAgent } from "agents/ai-chat-agent";
import { streamText, tool, jsonSchema, stepCountIs, convertToModelMessages } from "ai";
import { createWorkersAI } from "workers-ai-provider"; // TODO: or your provider (@ai-sdk/openai, @ai-sdk/anthropic, …)

export interface Env {
  ${className}: DurableObjectNamespace;
  AI: Ai; // run \`npx wrangler types\` to generate the full Env from your wrangler.jsonc bindings
}

export class ${className} extends AIChatAgent<Env> {
  async onChatMessage() {
    const workersai = createWorkersAI({ binding: this.env.AI });
    const result = streamText({
      model: workersai("@cf/meta/llama-3.3-70b-instruct"), // TODO: pick your model${model ? ` — the contract's "${primName}" skill prefers: ${model}` : ""}
      system: ${system}
      messages: await convertToModelMessages(this.messages), // ai SDK ≥6: convertToModelMessages is async
      stopWhen: stepCountIs(5), // TODO (yours): your loop policy
      tools, // resident tools below; lazy-register \`discoverableTools\` (cold-tail) on demand to save context
    });
    return result.toUIMessageStreamResponse();
  }
}

/** RESIDENT tools — DERIVED from the contract. Edit the \`execute\` bodies (the bespoke brain); the schemas are the contract's. */
${toolsConst(doc, "tools", resident, routes, opts.mcpUrl)}
${coldTail.length ? `/** COLD-TAIL tools — kept out of the default surface (C027 tier-trim); register on demand via discover_tools. */\n${toolsConst(doc, "discoverableTools", coldTail, routes, opts.mcpUrl)}` : ""}`;
}

function workerFile(className: string, agentFileName: string): string {
  return `// CANDIDATE — generated by @suluk/agents projectCloudflareAgent. The Worker entry: route to the agent, else fall through.
import { routeAgentRequest } from "agents";
import { ${className}, type Env } from "./agents/${agentFileName}";

export { ${className} };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (await routeAgentRequest(request, env)) ?? new Response("Not found", { status: 404 });
  },
};
`;
}

/** Project one agent → an owned Cloudflare Agents-SDK scaffold + its Durable Object descriptor. Pure, fail-loud. */
export function projectCloudflareAgent(doc: OpenAPIv4Document, agentName: string, opts: CloudflareAgentOptions = {}): CloudflareAgentArtifacts {
  assertAgentInstallable(doc, agentName); // a dangling ref / missing depth fails here, not by emitting a broken scaffold
  const className = opts.className ?? pascal(agentName);
  const agentFileName = className;
  const files: Record<string, string> = {
    [`src/agents/${agentFileName}.ts`]: agentFile(doc, agentName, className, opts),
    "src/index.ts": workerFile(className, agentFileName),
  };
  return {
    files,
    durableObjects: [{ binding: className, className }],
    reachableSubAgents: reachableSurface(doc, agentName).agents,
  };
}
