import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document } from "@suluk/core";
import { agenticPatterns, affordedPatterns } from "../src/index";

const op = () => ({ method: "post" as const, summary: "o", responses: { ok: { status: 200 as const } } });
const skill = { model: ["m"], tier: "resident" as const, provenance: { source: "https://x/i", contentHash: "h", version: "v" } };
const childRef = (k: string) => ({ ref: `#/x-suluk-agents/${k}` });

const doc: OpenAPIv4Document = {
  openapi: "4.0.0-candidate",
  info: { title: "P", version: "1.0.0" },
  paths: { "v1/op": { requests: { op: op() } } },
  "x-suluk-agents": {
    // a flat tool-user — no sub-agents, single pass: affords no multi-step pattern
    flat: { description: "A flat single-step tool-using agent.", maxDepth: 0, skills: { chat: skill }, routes: { op: { operationRef: "#/paths/v1~1op/requests/op" } }, agents: {} },
    // exactly one sub-agent → prompt-chaining
    chain: { description: "Pipes work through a single downstream stage.", maxDepth: 1, skills: { chat: skill }, agents: { next: childRef("flat") } },
    // two sub-agents + a skill → orchestrator-workers / parallelization / routing
    coordinator: { description: "Coordinates two worker sub-agents.", maxDepth: 1, skills: { chat: skill }, agents: { a: childRef("flat"), b: childRef("chain") } },
    // an iterative thinking envelope → evaluator-optimizer
    refiner: { description: "Iteratively refines its own output.", maxDepth: 0, skills: { chat: skill }, thinking: { maxRounds: 3 }, agents: {} },
    // a model-LESS multi-child agent — affords none of the LLM-coordinated patterns (needs a skill)
    dumbFanout: { description: "A model-less fan-out (degenerate).", maxDepth: 1, skills: {}, agents: { a: childRef("flat"), b: childRef("chain") } },
  },
};

describe("agenticPatterns (C035) — STRUCTURAL affordances, never a runtime claim", () => {
  test("every result is advisory (a capability, not an execution claim — C029 trajectory is opaque)", () => {
    expect(agenticPatterns(doc, "coordinator").every((a) => a.advisory === true)).toBe(true);
  });

  test("a flat single-step agent affords no multi-step pattern", () => {
    expect(affordedPatterns(doc, "flat")).toEqual([]);
  });

  test("exactly one sub-agent affords prompt-chaining (a linear pipe)", () => {
    expect(affordedPatterns(doc, "chain")).toEqual(["prompt-chaining"]);
  });

  test("≥2 sub-agents under a model-bearing coordinator afford orchestrator/parallel/routing (the runtime picks one)", () => {
    expect(affordedPatterns(doc, "coordinator").sort()).toEqual(["orchestrator-workers", "parallelization", "routing"]);
  });

  test("a multi-round thinking envelope affords evaluator-optimizer", () => {
    expect(affordedPatterns(doc, "refiner")).toEqual(["evaluator-optimizer"]);
    expect(agenticPatterns(doc, "refiner")[0]!.rationale).toContain("3 rounds");
  });

  test("a model-LESS multi-child agent affords none of the LLM-coordinated patterns (a skill is required)", () => {
    expect(affordedPatterns(doc, "dumbFanout")).toEqual([]);
  });

  test("an unknown agent name yields no affordances", () => {
    expect(agenticPatterns(doc, "nope")).toEqual([]);
  });
});
