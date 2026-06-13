import { test, expect, describe } from "bun:test";
import { reachableSurface, residentToolNames, assertServedSubset, verifySkillFreshness, contentHash } from "../src/index";
import { coninDoc, coninInstructions } from "./fixtures/conin";

describe("C027 conformance — static reachable surface + over-serve auditor", () => {
  test("the full reachable tool surface is statically enumerable (zero requests)", () => {
    const s = reachableSurface(coninDoc, "conin");
    expect(s.tools).toEqual(["find_comparables", "generate_deliverable", "run_core_primitive", "search_library"]);
    expect(s.agents).toEqual(["coninRetrieval"]);
  });

  test("a served set equal to the surface is conformant", () => {
    expect(assertServedSubset(coninDoc, "conin", ["generate_deliverable", "run_core_primitive", "search_library", "find_comparables"])).toEqual([]);
  });

  test("NAMED failure: a server that WIDENS the surface (Conin's full-catalog over-serve) is flagged", () => {
    const findings = assertServedSubset(coninDoc, "conin", ["generate_deliverable", "list_everything", "audit_boq_raw"]);
    expect(findings.map((f) => f.code)).toEqual(["over-serve", "over-serve"]);
    expect(findings[0].detail).toContain("list_everything");
  });
});

describe("C027 conformance — skill freshness (drift detection)", () => {
  const snap = coninInstructions.operate;
  test("a matching declared hash is fresh", () => {
    expect(verifySkillFreshness(contentHash(snap), snap)).toEqual([]);
  });
  test("a drifted served snapshot is caught as stale", () => {
    expect(verifySkillFreshness("sha256-0000000000000000", snap).map((f) => f.code)).toEqual(["stale-skill"]);
  });
  test("an unpinned skill (no declared hash) is flagged — drift would be invisible", () => {
    expect(verifySkillFreshness(undefined, snap).map((f) => f.code)).toEqual(["unpinned-skill"]);
  });
});

describe("C027 tier-trim serving — residentToolNames feeds mcpApp({ resident })", () => {
  test("covers the reachable surface's non-cold-tail routes (agent + sub-agents)", () => {
    // fixture: no route is cold-tail ⇒ the whole reachable surface is resident
    expect(residentToolNames(coninDoc, "conin")).toEqual(["find_comparables", "generate_deliverable", "run_core_primitive", "search_library"]);
  });
  test("a cold-tail route is WITHHELD from the resident feed but stays in the reachable surface (lossless)", () => {
    const d = structuredClone(coninDoc);
    (d as any)["x-suluk-agents"].conin.routes.run_core_primitive.tier = "cold-tail";
    const resident = residentToolNames(d, "conin");
    expect(resident).not.toContain("run_core_primitive");          // withheld from the default served surface
    expect(reachableSurface(d, "conin").tools).toContain("run_core_primitive"); // still declared + callable
    // feeding `resident` to mcpApp closes the over-serve gap: only resident tools advertised, cold-tail behind discover_tools
    expect(resident).toEqual(["find_comparables", "generate_deliverable", "search_library"]);
  });
});
