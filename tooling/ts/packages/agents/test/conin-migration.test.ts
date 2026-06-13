import { test, expect, describe } from "bun:test";
import { lintAgents, lintOk, reachableSurface, residentToolNames, analyzeScopes, projectClaudePlugin } from "../src/index";
import { coninContract, coninInstructions } from "../examples/conin.contract";

describe("conin migration — the real Construction-Intelligence agent on x-suluk-agents (C027)", () => {
  test("lints CLEAN — no cycle / dangling-ref / route-has-model / scope-escalation across 39 ops", () => {
    expect(lintOk(lintAgents(coninContract))).toBe(true);
  });
  test("the resident set reproduces conin's RESIDENT_TOOLS exactly (7 routes + the synthetic discover_tools)", () => {
    expect(residentToolNames(coninContract, "conin")).toEqual([
      "generate_deliverable", "get_study", "list_deliverables", "list_fixes", "list_library", "locate_project", "search_library",
    ]);
  });
  test("the cold-tail is withheld but reachable (lossless) — feeding residentToolNames to mcpApp closes the over-serve", () => {
    const reach = reachableSurface(coninContract, "conin").tools;
    const resident = new Set(residentToolNames(coninContract, "conin"));
    expect(reach.length).toBe(36);
    expect(reach.filter((t) => !resident.has(t)).length).toBe(29); // cold-tail, behind discover_tools
    expect(reach).toContain("run_core_primitive"); // a cold-tail tool is still declared + callable
  });
  test("the untrusted retrieval sub-agent does not escalate scope (orchestrator grants library:read)", () => {
    const esc = analyzeScopes(coninContract, "conin");
    expect((esc.escalations ?? (esc as never as unknown[])).length).toBe(0);
  });
  test("projects to a Claude plugin bundle (replaces the hand-built conin-plugin)", () => {
    const { files } = projectClaudePlugin(coninContract, "conin", { mcpUrl: "https://construction-intelligence.saastemly.com/mcp", instructions: coninInstructions });
    expect(Object.keys(files)).toContain("plugin.json");
    expect(Object.keys(files)).toContain(".mcp.json");
    expect(Object.keys(files)).toContain("skills/operate/SKILL.md");
  });
});
