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
  /** path → owned source the user writes into their Worker project (one agent file per REACHABLE agent + the worker). */
  files: Record<string, string>;
  /** ONE entry per reachable agent (root + transitive sub-agents) — feed straight to `@suluk/deploy`'s `durableObjects`
   *  / `@suluk/cloudflare`'s `DeployPlan.durableObjects` (Stage 1.1/1.2); each becomes a bound + migrated Durable Object. */
  durableObjects: { binding: string; className: string }[];
  /** the reachable sub-agent KEYS (x-suluk-agents map keys), each now scaffolded as its own file (cross-agent DISPATCH is yours to wire). */
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
${subAgents.length ? `// sub-agents (each scaffolded as its own src/agents/*.ts + Durable Object): ${subAgents.join(", ")} — wire the cross-agent dispatch in your loop.\n` : ""}import { AIChatAgent } from "agents/ai-chat-agent";
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

/** The Worker entry: import + export EVERY reachable agent class, declare the COMBINED Env (all DO bindings), route. */
function workerFile(classNames: string[]): string {
  const imports = classNames.map((c) => `import { ${c} } from "./agents/${c}";`).join("\n");
  const envBindings = classNames.map((c) => `  ${c}: DurableObjectNamespace;`).join("\n");
  return `// CANDIDATE — generated by @suluk/agents projectCloudflareAgent. The Worker entry: route to the agent(s), else fall through.
import { routeAgentRequest } from "agents";
${imports}

export { ${classNames.join(", ")} };

// the COMBINED Env (one binding per reachable agent). Each agent file declares its own local Env too; \`npx wrangler
// types\` regenerates the authoritative one from wrangler.jsonc.
export interface Env {
${envBindings}
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (await routeAgentRequest(request, env)) ?? new Response("Not found", { status: 404 });
  },
};
`;
}

/**
 * Project an agent → an owned Cloudflare Agents-SDK scaffold + the Durable Object descriptors. Pure, fail-loud.
 * Scaffolds the named agent AND every reachable sub-agent (each its own DO class file); the worker binds them all.
 * `opts.className` renames ONLY the root; sub-agents use PascalCase of their x-suluk-agents key.
 */
export function projectCloudflareAgent(doc: OpenAPIv4Document, agentName: string, opts: CloudflareAgentOptions = {}): CloudflareAgentArtifacts {
  assertAgentInstallable(doc, agentName); // a dangling ref / missing depth fails here, not by emitting a broken scaffold
  const subKeys = reachableSurface(doc, agentName).agents; // transitive sub-agent keys (deduped, root excluded)
  // each reachable agent → its class name (root may be overridden; sub-agents are PascalCase of their key).
  const agents = [{ key: agentName, className: opts.className ?? pascal(agentName) }, ...subKeys.map((k) => ({ key: k, className: pascal(k) }))];

  // fail-loud on a class-name collision rather than silently overwrite one agent's file with another's.
  const seen = new Set<string>();
  for (const a of agents) {
    if (seen.has(a.className)) throw new Error(`@suluk/agents: projectCloudflareAgent — two agents map to the class name "${a.className}" (an opts.className colliding with a sub-agent, or two x-suluk-agents keys that PascalCase alike); rename one`);
    seen.add(a.className);
  }

  const files: Record<string, string> = {};
  for (const a of agents) files[`src/agents/${a.className}.ts`] = agentFile(doc, a.key, a.className, opts);
  files["src/index.ts"] = workerFile(agents.map((a) => a.className));

  return {
    files,
    durableObjects: agents.map((a) => ({ binding: a.className, className: a.className })),
    reachableSubAgents: subKeys,
  };
}
