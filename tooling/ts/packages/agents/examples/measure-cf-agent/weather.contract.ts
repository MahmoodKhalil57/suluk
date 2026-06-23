/**
 * weather.contract.ts — the Suluk-contract side of the Stage-0 measurement
 * (doc/architecture/cloudflare-agents-roadmap.md). It re-expresses Cloudflare's canonical chat-agent example
 * (developers.cloudflare.com/agents/getting-started/build-a-chat-agent/) as ONE `x-suluk-agents` declaration so we can
 * measure how much of the hand-written Cloudflare agent falls out of the existing projection (`@suluk/agents`).
 *
 * The example's three tools, mapped to Suluk:
 *   • getWeather       — server-side lookup  → a normal operation (a Request) ⇒ FULLY contract-derivable tool.
 *   • calculate        — approval-gated math  → an operation whose SCHEMA + dispatch are derivable, but whose
 *                        `needsApproval` HITL gate is NOT yet expressible ⇒ motivates the Stage-1.4 x-suluk-approval facet.
 *   • getUserTimezone  — CLIENT-side browser tool → NOT an HTTP operation ⇒ stays hand-written (an honest limit).
 *
 * Faithful to a real chat agent: one model-bearing `chat` skill, a resident tool surface + one cold-tail tool to
 * exercise tier-trim. Body schemas are REAL (contentSchema) so the projected tool `parameters` are non-trivial.
 */
import type { OpenAPIv4Document, Request, HttpMethod, SulukRouteRef, SchemaOrRef } from "@suluk/core";

const ref = (p: string, o: string) => `#/paths/${p.replace(/\//g, "~1")}/requests/${o}`;
const r = (operationRef: string, scope: string[], tier: "resident" | "cold-tail", guarantee: SulukRouteRef["guarantee"] = "same-in-same-out"): SulukRouteRef =>
  ({ operationRef, guarantee, tier, scope });
/** an operation WITH a real body schema (so the projected tool `parameters` is the Zod-equivalent JSON Schema). */
const op = (method: HttpMethod, summary: string, body?: SchemaOrRef): Request => ({
  method, summary, ...(body ? { contentSchema: body } : {}), responses: { ok: { status: 200 } },
});

const str = (maxLength: number, pattern?: string): SchemaOrRef => ({ type: "string", maxLength, ...(pattern ? { pattern } : {}) });

export const weatherDoc: OpenAPIv4Document = {
  openapi: "4.0.0-candidate",
  info: { title: "Weather Assistant", version: "1.0.0" },
  paths: {
    "v1/weather": { requests: {
      getWeather: op("post", "Look up the current weather for a city.", {
        type: "object", additionalProperties: false,
        properties: { city: str(80, "^[\\p{L} .,'-]+$") }, required: ["city"],
      }),
    } },
    "v1/calculate": { requests: {
      calculate: op("post", "Evaluate an arithmetic expression and return the result.", {
        type: "object", additionalProperties: false,
        properties: { expression: str(256) }, required: ["expression"],
      }),
    } },
    "v1/forecast": { requests: {
      getForecast: op("post", "Multi-day forecast for a city (revealed on demand).", {
        type: "object", additionalProperties: false,
        properties: { city: str(80, "^[\\p{L} .,'-]+$"), days: { type: "integer", minimum: 1, maximum: 14 } },
        required: ["city"],
      }),
    } },
  },

  "x-suluk-agents": {
    weatherAssistant: {
      description: "A helpful assistant that can check the weather and do arithmetic.",
      scope: ["weather:read", "math:eval"],
      maxDepth: 0,
      skills: {
        chat: {
          model: ["anthropic/claude-sonnet-4", "openai/gpt-4.1-mini"],
          modelResolve: "pinned",
          tier: "resident",
          whenToUse: "Answer the user's questions; check the weather or evaluate arithmetic when asked.",
          provenance: { source: "https://weather.example.com/v1/instructions", contentHash: "sha256-0000weatherchat0000", version: "2026-06-22" },
        },
      },
      routes: {
        // RESIDENT — always-visible tools
        get_weather: r(ref("v1/weather", "getWeather"), ["weather:read"], "resident", "idempotent"),
        calculate:   r(ref("v1/calculate", "calculate"), ["math:eval"], "resident", "same-in-same-out"),
        // COLD-TAIL — revealed on demand via discover_tools (exercises the tier-trim)
        get_forecast: r(ref("v1/forecast", "getForecast"), ["weather:read"], "cold-tail", "idempotent"),
      },
      agents: {},
    },
  },
};

/** The pinned instruction snapshot a projector is fed (never fetched at generate time). */
export const weatherInstructions: Record<string, string> = {
  chat:
    "You are a helpful assistant. You can check the weather with get_weather and evaluate arithmetic with calculate. " +
    "When the user asks for a calculation, call calculate and report the result. Be concise.",
};
