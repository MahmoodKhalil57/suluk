/**
 * Runtime-agnostic derivation shared by every agent-runtime adapter (C034). The CONTRACT → TOOL-DEF mapping (a tool's
 * name + description + input schema + approval gate, from a route's operation) is the same for Cloudflare, Node, or any
 * future runtime — only the RENDERING (how a tool-def becomes source) differs per adapter. Keeping the derivation here
 * (and the rendering in each adapter) is what lets a second adapter reuse the proven mapping instead of forking it.
 */
import type { OpenAPIv4Document, SulukSkillRef, SchemaOrRef } from "@suluk/core";
import { resolveOperationRef } from "./resolve";

/** PascalCase a wire id (e.g. "weatherAssistant" → "WeatherAssistant", "conin-retrieval" → "ConinRetrieval"). */
export function pascal(s: string): string {
  const t = s.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/[^a-zA-Z0-9]/g, "");
  return (t.charAt(0).toUpperCase() + t.slice(1)) || "Agent";
}

/** The first skill that declares a model — the agent's primary LLM tier (mirrors project.ts). */
export function primarySkill(skills?: Record<string, SulukSkillRef>): [string, SulukSkillRef] | null {
  for (const [k, s] of Object.entries(skills ?? {})) if (s.model && s.model.length) return [k, s];
  return Object.entries(skills ?? {})[0] ?? null;
}

/** Indent a multi-line block by `n` spaces (for nesting a JSON-schema literal inside a tool definition). */
export const indent = (s: string, n: number) => s.split("\n").map((l, i) => (i === 0 ? l : " ".repeat(n) + l)).join("\n");

/** Cost bases that map to a FLAT per-call x402 `paidTool` price; the rest are usage-metered (MPP `session` territory). */
const FLAT_COST_BASES = new Set(["per-call", "per-request"]);

/** An x402 `paidTool` price derived from a route's declared `x-suluk-cost` (C026/C035). */
export interface PaidToolPrice {
  /** the flat per-call price in USD — the `paidTool(name, desc, PRICE, …)` argument. */
  priceUsd: number;
  /** the same, raw micro-USD (the cost model's native unit; 1 USD = 1_000_000 µ$). */
  microUsd: number;
  /** true ⇒ ALSO has usage-metered components a fixed per-call price can't capture — the honest pointer to MPP `session`. */
  metered: boolean;
}

/**
 * Derive an x402 `paidTool` price from an operation's declared `x-suluk-cost` (a `CostModel`, read STRUCTURALLY — no
 * `@suluk/cost` dep). The price is the FLAT (per-call/per-request) portion: `estimateMicroUsd` if given, else the sum
 * of flat components' `microUsd`. Usage-metered components (per-token/second/mb/unit) are NEVER folded into the fixed
 * number — they only set `metered` (so the projection can point at MPP `session` instead). Returns `null` when no
 * chargeable cost is declared (a free tool stays a plain `tool()`). DECLARED, never enforced (C026 honesty).
 */
export function paidToolPrice(cost: unknown): PaidToolPrice | null {
  if (!cost || typeof cost !== "object") return null;
  const c = cost as { components?: { basis?: string; microUsd?: number }[]; estimateMicroUsd?: number };
  const components = Array.isArray(c.components) ? c.components : [];
  const flatMicro = components.filter((x) => FLAT_COST_BASES.has(x.basis ?? "")).reduce((s, x) => s + (Number(x.microUsd) || 0), 0);
  const raw = typeof c.estimateMicroUsd === "number" ? c.estimateMicroUsd : flatMicro;
  // a negative declared cost is nonsensical (the field is a "typical total for one call") — floor at 0 so we NEVER emit
  // a negative price / a negative paidTool() argument into the owned scaffold.
  const micro = raw > 0 ? raw : 0;
  const metered = components.some((x) => x.basis != null && !FLAT_COST_BASES.has(x.basis));
  if (micro <= 0 && !metered) return null;
  return { priceUsd: micro / 1_000_000, microUsd: micro, metered };
}

/** A tool DERIVED from a route's operation — the runtime-agnostic shape every adapter renders its own way. */
export interface RouteToolDef {
  /** the wire-level tool id (the route key). */
  key: string;
  /** the LLM-facing description (the operation's summary/description; falls through an empty summary). */
  description: string;
  /** the input JSON Schema (the operation's body), fed verbatim to the runtime's tool factory. */
  schema: SchemaOrRef;
  /** the HITL gate from x-suluk-approval, when required (projects to e.g. the Agents SDK `needsApproval`). */
  approval?: { required: true; reason?: string };
  /** the x402 paidTool price from x-suluk-cost, when a chargeable cost is declared (DECLARED, never enforced — C026). */
  price?: PaidToolPrice;
  /** the by-name operationRef the tool dispatches to (used in the execute stub). */
  operationRef: string;
}

/** Derive a route's tool-def from the contract (name + description + input schema + approval gate + paid-tool price). */
export function routeToolDef(doc: OpenAPIv4Document, routeKey: string, operationRef: string): RouteToolDef {
  const req = resolveOperationRef(doc, operationRef)?.request; // installable ⇒ non-null
  // a TRIMMED-empty summary must fall through (lint allows an empty summary; the LLM routes on this description).
  const description = (req?.summary?.trim() || req?.description?.trim() || `route ${routeKey}`).replace(/\n/g, " ");
  const schema: SchemaOrRef = (req?.contentSchema ?? req?.parameterSchema?.body ?? { type: "object" }) as SchemaOrRef;
  const a = req?.["x-suluk-approval"];
  const approval = a?.required ? { required: true as const, ...(a.reason != null ? { reason: String(a.reason).replace(/\n/g, " ") } : {}) } : undefined;
  const price = paidToolPrice((req as { "x-suluk-cost"?: unknown } | undefined)?.["x-suluk-cost"]) ?? undefined;
  return { key: routeKey, description, schema, approval, ...(price ? { price } : {}), operationRef };
}

/** Render one tool-def as an `ai`-SDK `tool({...})` literal (+ the approval gate + an execute STUB). Runtime-agnostic —
 *  Cloudflare and Node both use the `ai` SDK's `tool()`; only the surrounding class/server wrapper differs per adapter. */
export function toolLiteral(def: RouteToolDef, mcpUrl?: string): string {
  const approvalLine = def.approval
    ? `\n    needsApproval: async () => true, // x-suluk-approval${def.approval.reason ? `: ${def.approval.reason}` : ""} — replace with your gate`
    : "";
  // x-suluk-cost → x402 paidTool. An AI-SDK tool() is not itself a paidTool (that lives on an McpServer), so we
  // SURFACE the declared price + the wiring path rather than silently claim a charge (C026 declared-not-enforced).
  const priceLine = def.price
    ? `\n    // x-suluk-cost → x402: charge $${def.price.priceUsd} per call by exposing this as an McpServer wrapped with`
      + `\n    //   withX402(...) and using server.paidTool("${def.key}", desc, ${def.price.priceUsd}, schema, {}, handler).`
      + (def.price.metered ? `\n    //   NOTE: also has usage-metered cost — a fixed price can't capture it; use MPP \`session\` for usage-based billing.` : "")
    : "";
  const dispatch = mcpUrl ? `call your API, or POST to the MCP endpoint ${mcpUrl}` : "call your API (or your MCP endpoint)";
  return `  ${def.key}: tool({
    description: ${JSON.stringify(def.description)},
    inputSchema: jsonSchema(${indent(JSON.stringify(def.schema, null, 2), 4)}),${approvalLine}${priceLine}
    // TODO (yours): perform the operation — ${dispatch}.
    execute: async (input) => { throw new Error("TODO: implement ${def.key} → ${def.operationRef}"); },
  }),`;
}

/** Render a named `const <name> = { …tools }` block from route keys (resident or cold-tail). */
export function toolsConst(doc: OpenAPIv4Document, name: string, keys: string[], routes: Record<string, { operationRef: string }>, mcpUrl?: string): string {
  if (!keys.length) return `export const ${name} = {};\n`;
  const body = keys.map((k) => toolLiteral(routeToolDef(doc, k, routes[k]!.operationRef), mcpUrl)).join("\n");
  return `export const ${name} = {\n${body}\n};\n`;
}
