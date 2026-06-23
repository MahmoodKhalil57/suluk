import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document } from "@suluk/core";
import { runtimeProviders, cloudflareRuntime, projectCloudflareAgent } from "../src/index";

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

  test("the adapter conforms to the generic interface: files + reachableSubAgents + a deploy hint", () => {
    const art = cloudflareRuntime.project(doc, "weatherAssistant");
    expect(Object.keys(art.files).sort()).toEqual(["src/agents/WeatherAssistant.ts", "src/index.ts"]);
    expect(art.reachableSubAgents).toEqual([]);
    // the Cloudflare-specific durableObjects descriptor rides in the generic `deploy` hint (for @suluk/deploy)
    expect(art.deploy).toEqual({ durableObjects: [{ binding: "WeatherAssistant", className: "WeatherAssistant" }] });
  });

  test("the adapter is a faithful wrapper — same files + durableObjects as the direct projection", () => {
    const direct = projectCloudflareAgent(doc, "weatherAssistant");
    const viaSeam = cloudflareRuntime.project(doc, "weatherAssistant");
    expect(viaSeam.files).toEqual(direct.files);
    expect((viaSeam.deploy as { durableObjects: unknown }).durableObjects).toEqual(direct.durableObjects);
  });

  test("a host can dispatch by provider name without knowing the concrete adapter (the swap point)", () => {
    const pick = (name: string) => runtimeProviders[name];
    const art = pick("cloudflare")!.project(doc, "weatherAssistant", { className: "WX" });
    expect(Object.keys(art.files)).toContain("src/agents/WX.ts");
  });
});
