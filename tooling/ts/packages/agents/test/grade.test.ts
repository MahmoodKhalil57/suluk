import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document, Request, SulukAgent } from "@suluk/core";
import { gradeAgent, gradeAgents, assertAgentGrade, agentGradeOk, gradeOf, contentHash } from "../src/index";

// ── tiny builder: a doc with N resolvable operations + an x-suluk-agents block ───────────────────────────────────
const ref = (p: string, o: string) => `#/paths/${p.replace(/\//g, "~1")}/requests/${o}`;
const op = (): Request => ({ method: "post", summary: "do a thing", responses: { ok: { status: 200 } } });
const OPS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
function doc(agents: Record<string, SulukAgent>): OpenAPIv4Document {
  const paths: OpenAPIv4Document["paths"] = {};
  for (const o of OPS) paths![`v1/${o}`] = { requests: { [o]: op() } };
  return { openapi: "4.0.0-candidate", info: { title: "t", version: "1.0.0" }, paths, "x-suluk-agents": agents };
}
const route = (o: string, tier: "resident" | "cold-tail" = "resident") => ({ operationRef: ref(`v1/${o}`, o), tier });
const PINNED = { source: "https://x/i", contentHash: "sha256-pinned", version: "2026-06-22" };

describe("gradeOf — harden's letter thresholds, mirrored", () => {
  test("≥90 A · ≥75 B · ≥60 C · ≥40 D · else F", () => {
    expect([100, 90, 89, 75, 74, 60, 59, 40, 39, 0].map(gradeOf)).toEqual(["A", "A", "B", "B", "C", "C", "D", "D", "F", "F"]);
  });
});

describe("a clean, well-tiered agent grades A and installs", () => {
  const d = doc({
    weather: {
      description: "A helpful assistant that checks the weather.",
      maxDepth: 0,
      skills: { chat: { model: ["anthropic/claude-sonnet-4"], tier: "resident", provenance: PINNED } },
      routes: { get_weather: route("a"), calculate: route("b"), get_forecast: route("c", "cold-tail") },
      agents: {},
    },
  });
  const r = gradeAgent(d, "weather");
  test("grade A, installable, no error/warning findings", () => {
    expect(r.grade).toBe("A");
    expect(r.shippable).toBe(true);
    expect(r.bySeverity.error).toBe(0);
    expect(r.bySeverity.warning).toBe(0);
    expect(r.score).toBe(100);
  });
});

describe("install-blocking errors cap the grade at F (an un-shippable agent)", () => {
  test("a sub-agent with no maxDepth → missing-max-depth error → not installable → F", () => {
    const d = doc({
      parent: { description: "calls a child", skills: {}, routes: {}, agents: { kid: { ref: "#/x-suluk-agents/child" } } },
      child: { description: "a leaf child", maxDepth: 0, skills: {}, routes: { x: route("a") }, agents: {} },
    });
    const r = gradeAgent(d, "parent");
    expect(r.shippable).toBe(false);
    expect(r.grade).toBe("F");
    expect(r.byDimension.lint.some((f) => f.code === "missing-max-depth")).toBe(true);
  });

  test("a dangling operationRef → error → F", () => {
    const d = doc({ a1: { description: "broken route", maxDepth: 0, skills: {}, routes: { gone: { operationRef: "#/paths/v1~1nope/requests/nope" } }, agents: {} } });
    const r = gradeAgent(d, "a1");
    expect(r.shippable).toBe(false);
    expect(r.grade).toBe("F");
    expect(r.byDimension.lint.some((f) => f.code === "dangling-operation-ref")).toBe(true);
  });
});

describe("the two STRUCTURE checks (not covered by lint/context/conformance)", () => {
  test("no-tiering: many routes, zero cold-tail → a warning that drops the grade", () => {
    const routes = Object.fromEntries(OPS.slice(0, 8).map((o) => [o, route(o)])); // 8 resident, none cold-tail
    const d = doc({ flat: { description: "a flat over-broad agent", maxDepth: 0, skills: { s: { model: ["m"], provenance: PINNED } }, routes, agents: {} } });
    const r = gradeAgent(d, "flat");
    expect(r.byDimension.structure.some((f) => f.code === "no-tiering")).toBe(true);
    expect(r.shippable).toBe(true);
    expect(r.grade).not.toBe("A"); // a warning costs points
  });

  test("skill-unpinned: a skill with no provenance → a warning", () => {
    const d = doc({ a2: { description: "unpinned skill agent", maxDepth: 0, skills: { s: { model: ["m"] } }, routes: { a: route("a") }, agents: {} } });
    const r = gradeAgent(d, "a2");
    expect(r.byDimension.structure.some((f) => f.code === "skill-unpinned")).toBe(true);
  });
});

describe("the rubric reserves F for ship-blocking ERRORS — warnings alone never drop below D", () => {
  test("an installable agent with many warnings is floored at D, never F", () => {
    const routes = Object.fromEntries(OPS.slice(0, 8).map((o) => [o, route(o)])); // 8 resident → no-tiering (1 warning)
    const skills = Object.fromEntries(["s1", "s2", "s3", "s4", "s5"].map((s) => [s, { model: ["m"] }])); // 5 unpinned (5 warnings)
    const d = doc({ noisy: { description: "an over-broad, unpinned agent", maxDepth: 0, skills, routes, agents: {} } });
    const r = gradeAgent(d, "noisy");
    expect(r.bySeverity.error).toBe(0);
    expect(r.shippable).toBe(true);
    expect(r.bySeverity.warning).toBeGreaterThanOrEqual(6); // would be 100−72=28 (F) without the floor
    expect(r.grade).toBe("D"); // floored at 40 — F is reserved for the error-cap
  });
});

describe("a single missing-provenance defect is NOT double-charged (score is invariant to supplying a snapshot)", () => {
  test("freshness skips the redundant unpinned-skill warning that structure already owns", () => {
    const d = doc({ unp: { description: "agent with an unpinned skill", maxDepth: 0, skills: { s: { model: ["m"] } }, routes: { a: route("a") }, agents: {} } });
    const without = gradeAgent(d, "unp");
    const withSnap = gradeAgent(d, "unp", { snapshots: { s: "any served text" } });
    expect(without.byDimension.structure.some((f) => f.code === "skill-unpinned")).toBe(true);
    expect(withSnap.byDimension.freshness.length).toBe(0);      // no redundant freshness warning
    expect(withSnap.score).toBe(without.score);                 // caller input doesn't change the score
  });
});

describe("served-fact conformance + freshness fold in ONLY when supplied", () => {
  const d = doc({
    svc: {
      description: "an agent with a pinned skill",
      maxDepth: 0,
      skills: { chat: { model: ["m"], tier: "resident", provenance: { source: "https://x/i", contentHash: contentHash("the served text"), version: "v" } } },
      routes: { get_weather: route("a"), get_forecast: route("b", "cold-tail") },
      agents: {},
    },
  });

  test("over-serve: a served tool NOT in the reachable surface → error → F", () => {
    const r = gradeAgent(d, "svc", { served: ["get_weather", "smuggled_tool"] });
    expect(r.byDimension.conformance.some((f) => f.code === "over-serve")).toBe(true);
    expect(r.shippable).toBe(false);
    expect(r.grade).toBe("F");
  });

  test("cold-tail-in-default: a cold-tail tool in the default served set → error", () => {
    const r = gradeAgent(d, "svc", { served: ["get_weather", "get_forecast"] });
    expect(r.byDimension.conformance.some((f) => f.code === "cold-tail-in-default")).toBe(true);
  });

  test("freshness: a snapshot that doesn't match the pinned hash → stale-skill error → F", () => {
    const r = gradeAgent(d, "svc", { snapshots: { chat: "DRIFTED served text" } });
    expect(r.byDimension.freshness.some((f) => f.code === "stale-skill")).toBe(true);
    expect(r.grade).toBe("F");
  });

  test("freshness: a matching snapshot is clean (no finding)", () => {
    const r = gradeAgent(d, "svc", { snapshots: { chat: "the served text" } });
    expect(r.byDimension.freshness.length).toBe(0);
  });

  test("with NO served/snapshots, conformance + freshness contribute nothing", () => {
    const r = gradeAgent(d, "svc");
    expect(r.byDimension.conformance.length).toBe(0);
    expect(r.byDimension.freshness.length).toBe(0);
  });
});

describe("assertAgentGrade — the CI gate (mirrors harden's assertGrade)", () => {
  const clean = doc({ ok: { description: "a clean agent here", maxDepth: 0, skills: { s: { model: ["m"], provenance: PINNED } }, routes: { a: route("a"), b: route("b", "cold-tail") }, agents: {} } });
  test("returns the report when the grade meets the floor", () => {
    const r = assertAgentGrade(clean, "ok", "A");
    expect(r.grade).toBe("A");
  });
  test("throws below the floor, naming the agent + the worst findings", () => {
    const broken = doc({ bad: { description: "x", skills: {}, routes: {}, agents: { k: { ref: "#/x-suluk-agents/missing" } } } });
    expect(() => assertAgentGrade(broken, "bad", "B")).toThrow(/grade F .* below the required B/);
  });
  test("agentGradeOk reflects the ordering", () => {
    expect(agentGradeOk(gradeAgent(clean, "ok"), "B")).toBe(true);
    const f = gradeAgent(doc({ z: { description: "x", skills: {}, routes: { g: { operationRef: "#/paths/nope/requests/n" } }, agents: {} } }), "z");
    expect(agentGradeOk(f, "C")).toBe(false);
  });
  test("throws for an unknown agent name", () => {
    expect(() => gradeAgent(clean, "nope")).toThrow(/no agent "nope"/);
  });
});

describe("gradeAgents — the rollup sorts weakest first", () => {
  test("a broken agent sorts before a clean one", () => {
    const d = doc({
      good: { description: "a clean agent here", maxDepth: 0, skills: { s: { model: ["m"], provenance: PINNED } }, routes: { a: route("a"), b: route("b", "cold-tail") }, agents: {} },
      bad: { description: "x", skills: {}, routes: { g: { operationRef: "#/paths/nope/requests/n" } }, agents: {} },
    });
    const rollup = gradeAgents(d);
    expect(rollup.map((r) => r.agent)).toEqual(["bad", "good"]);
    expect(rollup[0].grade).toBe("F");
    expect(rollup[1].grade).toBe("A");
  });
});
