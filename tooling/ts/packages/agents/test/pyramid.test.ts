import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document } from "@suluk/core";
import { agentLevel, layerReport, FLOOR_LEVEL } from "../src/index";

// A two-level pyramid: `calculator` (routes only — sits just above the deterministic floor) and `assistant`
// (skills + a route + the calculator as a sub-agent — one level higher).
const doc: OpenAPIv4Document = {
  openapi: "4.0.0-candidate",
  info: { title: "Calc", version: "1.0.0" },
  paths: {
    "v1/add": { requests: { add: { method: "post", summary: "add", responses: { ok: { status: 200 } } } } },
    "v1/mul": { requests: { mul: { method: "post", summary: "mul", responses: { ok: { status: 200 } } } } },
  },
  "x-suluk-agents": {
    calculator: {
      description: "Deterministic arithmetic over the add and mul routes.",
      routes: {
        add: { operationRef: "#/paths/v1~1add/requests/add", guarantee: "same-in-same-out" },
        mul: { operationRef: "#/paths/v1~1mul/requests/mul", guarantee: "same-in-same-out" },
      },
      agents: {},
      maxDepth: 0,
    },
    assistant: {
      description: "A helpful assistant that does math by delegating to the calculator sub-agent.",
      skills: { chat: { model: ["m"], tier: "resident", provenance: { source: "https://x/i", contentHash: "sha256-x", version: "v" } } },
      routes: { add: { operationRef: "#/paths/v1~1add/requests/add" } },
      agents: { calc: { ref: "#/x-suluk-agents/calculator" } },
      maxDepth: 1,
    },
  },
};

describe("agentLevel (C035) — composition height above the deterministic route-floor", () => {
  test("a leaf agent (routes only, no sub-agents) sits at level 1, directly above the floor", () => {
    expect(agentLevel(doc, "calculator")).toBe(1);
  });

  test("an agent composing a sub-agent is 1 + the child's level", () => {
    expect(agentLevel(doc, "assistant")).toBe(2);
  });

  test("a name that is not an orchestrating agent is the FLOOR (routes live at level 0)", () => {
    expect(agentLevel(doc, "not-an-agent")).toBe(FLOOR_LEVEL);
    expect(FLOOR_LEVEL).toBe(0);
  });

  test("a sub-agent cycle makes the level unbounded (Infinity) — cycle-safe, never hangs", () => {
    const cyclic: OpenAPIv4Document = {
      ...doc,
      "x-suluk-agents": { loop: { description: "An agent that references itself.", agents: { self: { ref: "#/x-suluk-agents/loop" } }, maxDepth: 1 } },
    };
    expect(agentLevel(cyclic, "loop")).toBe(Infinity);
  });
});

describe("layerReport (C035) — the per-layer observability surface (a COMPOSITION of shipped analyzers)", () => {
  const rep = layerReport(doc);

  test("layers are one-per-agent, sorted by (level asc, then name)", () => {
    expect(rep.layers.map((l) => l.agent)).toEqual(["calculator", "assistant"]);
    expect(rep.layers.map((l) => l.level)).toEqual([1, 2]);
    expect(rep.maxLevel).toBe(2);
    expect(rep.byLevel).toEqual({ 1: ["calculator"], 2: ["assistant"] });
  });

  test("the floor is the distinct, resolvable route operationRefs across all agents (sorted)", () => {
    expect(rep.floor).toEqual(["#/paths/v1~1add/requests/add", "#/paths/v1~1mul/requests/mul"]);
  });

  test("composition counts express the determinism gradient (routes=deterministic floor, skills=internal AI)", () => {
    const calc = rep.layers.find((l) => l.agent === "calculator")!;
    expect({ r: calc.routeCount, s: calc.skillCount, a: calc.subAgentCount }).toEqual({ r: 2, s: 0, a: 0 });
    const asst = rep.layers.find((l) => l.agent === "assistant")!;
    expect({ r: asst.routeCount, s: asst.skillCount, a: asst.subAgentCount }).toEqual({ r: 1, s: 1, a: 1 });
  });

  test("each layer folds in the hardening grade + a context estimate (reused, not re-derived)", () => {
    for (const l of rep.layers) {
      expect(["A", "B", "C", "D", "F"]).toContain(l.grade!);
      expect(typeof l.shippable).toBe("boolean");
      expect(typeof l.contextTokens).toBe("number");
    }
  });

  test("TOKEN WARNING — a declared contextBudget the estimate exceeds flags overBudget; a generous one does not", () => {
    const tiny = structuredClone(doc);
    tiny["x-suluk-agents"]!.assistant.contextBudget = { tokens: 1, basis: "estimate" };
    const over = layerReport(tiny).layers.find((l) => l.agent === "assistant")!;
    expect(over.budget).toBe(1);
    expect(over.overBudget).toBe(true);

    const big = structuredClone(doc);
    big["x-suluk-agents"]!.assistant.contextBudget = { tokens: 1_000_000_000, basis: "estimate" };
    expect(layerReport(big).layers.find((l) => l.agent === "assistant")!.overBudget).toBe(false);

    // no declared budget ⇒ no budget column, no warning (absence, not false-positive)
    const none = rep.layers.find((l) => l.agent === "assistant")!;
    expect(none.budget).toBeUndefined();
    expect(none.overBudget).toBeUndefined();
  });

  test("TOKEN WARNING uses PEAK load (thinking accretion), matching contextReport — not just the default total", () => {
    const thinker: OpenAPIv4Document = {
      openapi: "4.0.0-candidate", info: { title: "T", version: "1.0.0" }, paths: {},
      "x-suluk-agents": {
        refiner: {
          description: "Iteratively refines with a large thinking budget.",
          maxDepth: 0,
          skills: { chat: { model: ["m"], tier: "resident", provenance: { source: "https://x/i", contentHash: "h", version: "v" } } },
          thinking: { maxRounds: 4, budget: { tokens: 100_000, basis: "estimate" } },
          agents: {},
        },
      },
    };
    const total = layerReport(thinker).layers.find((l) => l.agent === "refiner")!.contextTokens!;
    // a budget just ABOVE the default load but FAR below the thinking peak — must flag overBudget on the PEAK basis.
    // The old totalTokens basis would miss it (total > total+1 === false), so this guards the analyzer-vs-pyramid gap.
    const withBudget = structuredClone(thinker);
    withBudget["x-suluk-agents"]!.refiner.contextBudget = { tokens: total + 1, basis: "estimate" };
    expect(layerReport(withBudget).layers.find((l) => l.agent === "refiner")!.overBudget).toBe(true);
  });

  test("a cyclic agent is reported (level -1, cyclic) instead of hanging or poisoning the whole report", () => {
    const cyclic: OpenAPIv4Document = {
      ...doc,
      "x-suluk-agents": { loop: { description: "An agent that references itself.", agents: { self: { ref: "#/x-suluk-agents/loop" } }, maxDepth: 1 } },
    };
    const row = layerReport(cyclic).layers.find((l) => l.agent === "loop")!;
    expect(row.cyclic).toBe(true);
    expect(row.level).toBe(-1);
    expect(layerReport(cyclic).byLevel[-1]).toEqual(["loop"]);
  });
});
