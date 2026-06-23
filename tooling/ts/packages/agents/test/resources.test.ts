import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document } from "@suluk/core";
import { resourceCatalog, lintResources, resourcesOk } from "../src/index";

const skill = { model: ["m"], tier: "resident" as const, provenance: { source: "https://x/i", contentHash: "h", version: "v" } };

const doc: OpenAPIv4Document = {
  openapi: "4.0.0-candidate",
  info: { title: "R", version: "1.0.0" },
  paths: {},
  "x-suluk-resources": {
    deployChecklist: { description: "Production deployment checklist.", kind: "instructions", provenance: { source: "https://e/dc", contentHash: "sha256-a", version: "1" }, trust: "author-declared" },
    styleGuide: { description: "Company style guide.", kind: "reference", provenance: { source: "https://e/sg", contentHash: "sha256-b" } },
  },
  "x-suluk-agents": {
    assistant: {
      description: "Activates the deploy checklist on demand.",
      maxDepth: 0,
      skills: { chat: skill },
      routes: {},
      agents: {},
      resources: { deploy: { ref: "#/x-suluk-resources/deployChecklist" }, style: { ref: "#/x-suluk-resources/styleGuide" } },
    },
  },
};

describe("resourceCatalog (C036) — the CF Agent-Skill get() listing an agent's catalog projects to", () => {
  test("resolves the agent's direct resource refs into a sorted catalog listing", () => {
    const cat = resourceCatalog(doc, "assistant");
    expect(cat.map((e) => e.key)).toEqual(["deployChecklist", "styleGuide"]);
    expect(cat[0]).toMatchObject({ key: "deployChecklist", local: "deploy", kind: "instructions", trust: "author-declared" });
    expect(cat[1]).toMatchObject({ key: "styleGuide", kind: "reference", trust: "author-declared" }); // default trust
  });

  test("the returned provenance is a defensive copy — mutating a catalog entry never writes through to the document", () => {
    const cat = resourceCatalog(doc, "assistant");
    cat[0]!.provenance.contentHash = "MUTATED";
    expect(doc["x-suluk-resources"]!.deployChecklist.provenance.contentHash).toBe("sha256-a");
  });

  test("an agent with no resources has an empty catalog", () => {
    const d = { ...doc, "x-suluk-agents": { bare: { description: "no resources", maxDepth: 0, skills: {}, routes: {}, agents: {} } } } as OpenAPIv4Document;
    expect(resourceCatalog(d, "bare")).toEqual([]);
  });
});

describe("lintResources (C036) — well-formedness + dangling refs + the experimental-script flag", () => {
  test("a clean catalog passes (no errors)", () => {
    expect(lintResources(doc).filter((f) => f.severity === "error")).toEqual([]);
    expect(resourcesOk(doc)).toBe(true);
  });

  test("a dangling agent ref is an error", () => {
    const d = structuredClone(doc);
    d["x-suluk-agents"]!.assistant.resources!.ghost = { ref: "#/x-suluk-resources/nope" };
    const f = lintResources(d);
    expect(f.some((x) => x.code === "resource-dangling-ref")).toBe(true);
    expect(resourcesOk(d)).toBe(false);
  });

  test("an unpinned resource (missing provenance) is an error", () => {
    const d = structuredClone(doc);
    (d["x-suluk-resources"]!.styleGuide as any).provenance = { source: "https://e/sg" }; // no contentHash
    expect(lintResources(d).some((x) => x.code === "resource-unpinned")).toBe(true);
  });

  test("kind:script is flagged a warning (CF script execution is experimental); retrieved content is an info note", () => {
    const d = structuredClone(doc);
    d["x-suluk-resources"]!.runner = { description: "A bundled script.", kind: "script", provenance: { source: "https://e/r", contentHash: "sha256-c" }, trust: "retrieved" };
    const codes = lintResources(d).map((f) => f.code);
    expect(codes).toContain("resource-script-experimental");
    expect(codes).toContain("resource-retrieved");
  });
});
