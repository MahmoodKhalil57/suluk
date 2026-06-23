import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document, Request, SchemaOrRef, SulukApproval } from "@suluk/core";
import { projectCloudflareAgent } from "../src/index";

const ref = (p: string, o: string) => `#/paths/${p.replace(/\//g, "~1")}/requests/${o}`;
const op = (body?: SchemaOrRef, approval?: SulukApproval): Request => ({
  method: "post", summary: "do the thing", ...(body ? { contentSchema: body } : {}),
  ...(approval ? { "x-suluk-approval": approval } : {}), responses: { ok: { status: 200 } },
});
const str = (max: number): SchemaOrRef => ({ type: "string", maxLength: max });

const doc: OpenAPIv4Document = {
  openapi: "4.0.0-candidate",
  info: { title: "Weather", version: "1.0.0" },
  paths: {
    "v1/weather": { requests: { getWeather: op({ type: "object", additionalProperties: false, properties: { city: str(80) }, required: ["city"] }) } },
    "v1/calculate": { requests: { calculate: op({ type: "object", additionalProperties: false, properties: { expression: str(256) }, required: ["expression"] }, { required: true, reason: "arithmetic can be destructive" }) } },
    "v1/forecast": { requests: { getForecast: op({ type: "object", properties: { city: str(80) } }) } },
  },
  "x-suluk-agents": {
    weatherAssistant: {
      description: "A helpful assistant that checks the weather.",
      maxDepth: 0,
      skills: { chat: { model: ["anthropic/claude-sonnet-4"], tier: "resident", provenance: { source: "https://x/i", contentHash: "sha256-x", version: "v" } } },
      routes: {
        get_weather: { operationRef: ref("v1/weather", "getWeather"), tier: "resident" },
        calculate: { operationRef: ref("v1/calculate", "calculate"), tier: "resident" },
        get_forecast: { operationRef: ref("v1/forecast", "getForecast"), tier: "cold-tail" },
      },
      agents: {},
    },
  },
};

describe("projectCloudflareAgent — owned Cloudflare Agents-SDK scaffold from one declaration", () => {
  const art = projectCloudflareAgent(doc, "weatherAssistant", { instructions: { chat: "You are a helpful weather assistant." } });
  const agentSrc = art.files["src/agents/WeatherAssistant.ts"]!;
  const workerSrc = art.files["src/index.ts"]!;

  test("emits the agent class file + the worker entry", () => {
    expect(Object.keys(art.files).sort()).toEqual(["src/agents/WeatherAssistant.ts", "src/index.ts"]);
  });

  test("returns the Durable Object descriptor to feed @suluk/deploy / @suluk/cloudflare (closes Stage 1.1/1.2)", () => {
    expect(art.durableObjects).toEqual([{ binding: "WeatherAssistant", className: "WeatherAssistant" }]);
    expect(art.reachableSubAgents).toEqual([]);
  });

  test("the agent class extends AIChatAgent and wires resident tools DERIVED from the contract", () => {
    expect(agentSrc).toContain("export class WeatherAssistant extends AIChatAgent<Env>");
    expect(agentSrc).toContain("export const tools = {");
    expect(agentSrc).toContain("get_weather: tool({");
    expect(agentSrc).toContain("calculate: tool({");
    // the input schema is the contract's, faithfully (via the ai SDK's jsonSchema())
    expect(agentSrc).toContain("jsonSchema(");
    expect(agentSrc).toContain('"city"');
    expect(agentSrc).toContain('"expression"');
  });

  test("cold-tail routes go in discoverableTools (the C027 tier-trim), not the default tools surface", () => {
    expect(agentSrc).toContain("export const discoverableTools = {");
    expect(agentSrc).toContain("get_forecast: tool({");
    // get_forecast must be in discoverableTools, NOT tools — assert it appears AFTER the discoverableTools marker
    expect(agentSrc.indexOf("get_forecast")).toBeGreaterThan(agentSrc.indexOf("export const discoverableTools"));
  });

  test("x-suluk-approval projects to a needsApproval gate (+ the reason as a comment)", () => {
    expect(agentSrc).toContain("needsApproval: async () => true");
    expect(agentSrc).toContain("arithmetic can be destructive");
    // a non-gated tool has NO needsApproval line
    const weatherBlock = agentSrc.slice(agentSrc.indexOf("get_weather: tool({"), agentSrc.indexOf("calculate: tool({"));
    expect(weatherBlock).not.toContain("needsApproval");
  });

  test("execute bodies are explicit TODO stubs (the bespoke brain stays the author's)", () => {
    expect(agentSrc).toContain('throw new Error("TODO: implement get_weather');
  });

  test("the worker entry routes to the agent via routeAgentRequest and exports the class", () => {
    expect(workerSrc).toContain("import { routeAgentRequest } from \"agents\"");
    expect(workerSrc).toContain("export { WeatherAssistant }");
    expect(workerSrc).toContain("routeAgentRequest(request, env)");
  });

  test("the pinned system prompt is inlined with its contentHash; the model preference is surfaced", () => {
    expect(agentSrc).toContain('"You are a helpful weather assistant."');
    expect(agentSrc).toContain("contentHash sha256-");
    expect(agentSrc).toContain("anthropic/claude-sonnet-4");
  });

  test("L3 boundary: NO credential/token/secret is ever embedded in the emitted source", () => {
    const all = Object.values(art.files).join("\n");
    expect(all).not.toMatch(/bearer|token|secret|api[_-]?key/i);
  });

  test("PURE: same contract in → byte-identical artifacts out", () => {
    const again = projectCloudflareAgent(doc, "weatherAssistant", { instructions: { chat: "You are a helpful weather assistant." } });
    expect(again).toEqual(art);
  });
});

describe("projectCloudflareAgent — options + fail-loud", () => {
  test("className override renames the class, file, and binding", () => {
    const art = projectCloudflareAgent(doc, "weatherAssistant", { className: "Weather" });
    expect(Object.keys(art.files)).toContain("src/agents/Weather.ts");
    expect(art.durableObjects[0]).toEqual({ binding: "Weather", className: "Weather" });
    expect(art.files["src/agents/Weather.ts"]).toContain("export class Weather extends AIChatAgent<Env>");
  });

  test("with no instruction snapshot, the system prompt is a clearly-marked TODO pointer", () => {
    const art = projectCloudflareAgent(doc, "weatherAssistant");
    expect(art.files["src/agents/WeatherAssistant.ts"]).toContain("TODO: your system prompt");
  });

  test("a dangling operationRef does NOT emit a broken scaffold — it throws (fail-loud, like the other projections)", () => {
    const broken: OpenAPIv4Document = structuredClone(doc);
    broken["x-suluk-agents"]!.weatherAssistant.routes!.get_weather.operationRef = "#/paths/v1~1nope/requests/nope";
    expect(() => projectCloudflareAgent(broken, "weatherAssistant")).toThrow(/does not install|dangling/);
  });
});
