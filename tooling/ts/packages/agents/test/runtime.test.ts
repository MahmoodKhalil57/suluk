import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document } from "@suluk/core";
import { runtimeProviders, cloudflareRuntime, nodeRuntime, projectCloudflareAgent } from "../src/index";

const doc: OpenAPIv4Document = {
  openapi: "4.0.0-candidate",
  info: { title: "Weather", version: "1.0.0" },
  paths: { "v1/weather": { requests: { getWeather: { method: "post", summary: "weather", responses: { ok: { status: 200 } } } } } },
  "x-suluk-agents": {
    weatherAssistant: {
      description: "A helpful weather assistant.",
      maxDepth: 0,
      skills: { chat: { model: ["m"], tier: "resident", provenance: { source: "https://x/i", contentHash: "sha256-x", version: "v" } } },
      routes: { get_weather: { operationRef: "#/paths/v1~1weather/requests/getWeather", tier: "resident" } },
      agents: {},
    },
  },
};

describe("the agent-runtime seam (C034) — swappable provider, Cloudflare first (mirrors @suluk/deploy)", () => {
  test("the registry resolves the cloudflare runtime adapter by name", () => {
    expect(runtimeProviders.cloudflare).toBe(cloudflareRuntime);
    expect(runtimeProviders.cloudflare!.name).toBe("cloudflare");
  });

  test("the adapter conforms to the generic interface: files + reachableSubAgents + a TYPED deploy hint", () => {
    const art = cloudflareRuntime.project(doc, "weatherAssistant");
    expect(Object.keys(art.files).sort()).toEqual(["src/agents/WeatherAssistant.ts", "src/index.ts"]);
    expect(art.reachableSubAgents).toEqual([]);
    // the deploy hint is a discriminated union — Cloudflare carries its durableObjects descriptor (for @suluk/deploy)
    expect(art.deploy).toEqual({ kind: "cloudflare", durableObjects: [{ binding: "WeatherAssistant", className: "WeatherAssistant" }] });
  });

  test("the adapter is a faithful wrapper — same files + durableObjects as the direct projection", () => {
    const direct = projectCloudflareAgent(doc, "weatherAssistant");
    const viaSeam = cloudflareRuntime.project(doc, "weatherAssistant");
    expect(viaSeam.files).toEqual(direct.files);
    expect(viaSeam.deploy).toEqual({ kind: "cloudflare", durableObjects: direct.durableObjects });
  });

  test("a host can dispatch by provider name without knowing the concrete adapter (the swap point)", () => {
    const pick = (name: string) => runtimeProviders[name];
    const art = pick("cloudflare")!.project(doc, "weatherAssistant", { className: "WX" });
    expect(Object.keys(art.files)).toContain("src/agents/WX.ts");
  });
});

describe("the SECOND runtime adapter (Node/Bun) — validates the seam generalizes to a different deploy shape", () => {
  test("the registry resolves the node adapter; it conforms to the SAME interface with a DIFFERENT deploy kind", () => {
    expect(runtimeProviders.node).toBe(nodeRuntime);
    const art = nodeRuntime.project(doc, "weatherAssistant");
    expect(Object.keys(art.files)).toEqual(["src/server.ts"]);          // a Bun server, not a DO class + worker
    expect(art.deploy).toEqual({ kind: "node" });                        // no provisioned infra — the union's other arm
    expect(art.reachableSubAgents).toEqual([]);
  });

  test("the Node scaffold reuses the SAME contract-derived tools (Bun.serve host wrapper, no Durable Objects)", () => {
    const src = nodeRuntime.project(doc, "weatherAssistant").files["src/server.ts"]!;
    expect(src).toContain("Bun.serve(");
    expect(src).not.toContain("AIChatAgent");        // a different host than the Cloudflare adapter
    expect(src).not.toContain("DurableObjectNamespace");
    expect(src).toContain("get_weather: tool({");    // same tool derivation (runtime-shared)
    expect(src).toContain("jsonSchema(");
  });

  test("the emitted SYSTEM line terminates BEFORE its comment (no dead ; commented out)", () => {
    const src = nodeRuntime.project(doc, "weatherAssistant", { instructions: { chat: "You are helpful." } }).files["src/server.ts"]!;
    expect(src).toContain('const SYSTEM = "You are helpful."; //'); // `;` precedes the comment
    expect(src).not.toMatch(/const SYSTEM = [^\n]*\/\/[^\n]*;/);     // never `= value // comment;` (`;` inside the comment)
  });

  test("a host dispatches cloudflare vs node by name through the one registry (the seam's whole point)", () => {
    expect(Object.keys(runtimeProviders.cloudflare!.project(doc, "weatherAssistant").files)).toContain("src/index.ts");
    expect(Object.keys(runtimeProviders.node!.project(doc, "weatherAssistant").files)).toContain("src/server.ts");
  });
});
