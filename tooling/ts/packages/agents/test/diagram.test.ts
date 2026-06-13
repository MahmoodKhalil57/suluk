import { test, expect, describe } from "bun:test";
import { agentDiagram, agentDiagramHtml } from "../src/index";
import { coninContract } from "../examples/conin.contract";

const groups = (n: any) => (n.children ?? []).map((c: any) => c.label);

describe("agent diagram (C027 OBSERVE) — composition → zoomable tree", () => {
  test("root is the agent; groups split skills / resident vs cold-tail routes / sub-agents", () => {
    const d = agentDiagram(coninContract, "conin");
    expect(d.kind).toBe("agent");
    expect(groups(d)).toEqual(["Skills", "Resident routes", "Cold-tail routes", "Sub-agents"]);
  });
  test("the tier-trim is legible at a glance (resident default-served, cold-tail behind discover_tools)", () => {
    const d = agentDiagram(coninContract, "conin");
    const resident = (d.children ?? []).find((c: any) => c.label === "Resident routes") as any;
    const cold = (d.children ?? []).find((c: any) => c.label === "Cold-tail routes") as any;
    expect(resident.tier).toBe("resident"); expect(resident.badges).toContain("default-served");
    expect(cold.tier).toBe("cold-tail"); expect(cold.badges).toContain("behind discover_tools"); expect(cold.collapsed).toBe(true);
    expect(resident.children.length + cold.children.length).toBe(29); // conin's orchestrator routes
  });
  test("sub-agents recurse (drill-in) and carry the trust boundary", () => {
    const d = agentDiagram(coninContract, "conin");
    const sub = ((d.children ?? []).find((c: any) => c.label === "Sub-agents") as any).children[0];
    expect(sub.kind).toBe("subagent");
    expect(sub.badges.some((b: string) => b.includes("trust untrusted"))).toBe(true);
    expect(groups(sub)).toContain("Resident routes"); // its own subtree
  });
  test("agentDiagramHtml is a self-contained page with D3 + inlined data, HTML-escaped", () => {
    const html = agentDiagramHtml(coninContract, "conin");
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("d3@7");
    expect(html).toContain('"kind":"agent"');
    expect(html).not.toMatch(/<script>[^]*<\/script>[^]*"<script"/); // data's "<" was escaped to <
  });
});
