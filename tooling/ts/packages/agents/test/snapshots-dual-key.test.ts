import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document } from "@suluk/core";
import { gradeAgent, agentManifest, verifyAgentFreshness, contentHash } from "../src/index";

// One pinned skill; SERVED hashes to the pin (fresh), DRIFTED does not (stale). The same `snapshots` map must feed
// BOTH gradeAgent (which historically read bare `<skill>`) and verifyAgentFreshness (which read qualified
// `<agent>/<skill>`) — the split the `instructions` unification already closed, now closed for `snapshots` too.
const SERVED = "the pinned served instructions";
const DRIFTED = "drifted served instructions";
const pinned = contentHash(SERVED);

const doc: OpenAPIv4Document = {
  openapi: "4.0.0-candidate",
  info: { title: "Svc", version: "1.0.0" },
  paths: { "v1/op": { requests: { op: { method: "post", summary: "o", responses: { ok: { status: 200 } } } } } },
  "x-suluk-agents": {
    svc: {
      description: "A service agent with one pinned skill.",
      maxDepth: 0,
      skills: { chat: { model: ["m"], tier: "resident", provenance: { source: "https://x/i", contentHash: pinned, version: "v" } } },
      routes: { op: { operationRef: "#/paths/v1~1op/requests/op" } },
      agents: {},
    },
  },
};

const isStale = (findings: { code: string }[]) => findings.some((f) => f.code === "stale-skill");

describe("snapshots key-convention unification — gradeAgent accepts BOTH conventions", () => {
  test("the NEW qualified `<agent>/<skill>` key is now honored (was bare-only)", () => {
    expect(isStale(gradeAgent(doc, "svc", { snapshots: { "svc/chat": DRIFTED } }).byDimension.freshness)).toBe(true);
    expect(gradeAgent(doc, "svc", { snapshots: { "svc/chat": SERVED } }).byDimension.freshness.length).toBe(0);
  });

  test("the original bare `<skill>` key still works (back-compat)", () => {
    expect(isStale(gradeAgent(doc, "svc", { snapshots: { chat: DRIFTED } }).byDimension.freshness)).toBe(true);
  });

  test("qualified WINS over bare when both are present (precedence)", () => {
    // qualified=fresh, bare=drifted ⇒ clean (qualified beats bare)
    expect(gradeAgent(doc, "svc", { snapshots: { "svc/chat": SERVED, chat: DRIFTED } }).byDimension.freshness.length).toBe(0);
  });
});

describe("snapshots key-convention unification — verifyAgentFreshness accepts BOTH conventions", () => {
  const m = agentManifest(doc, "svc");

  test("the NEW bare `<skill>` key is now honored (was qualified-only)", () => {
    expect(isStale(verifyAgentFreshness(m, { chat: DRIFTED }))).toBe(true);
    expect(verifyAgentFreshness(m, { chat: SERVED }).filter((f) => f.code === "stale-skill")).toEqual([]);
  });

  test("the original qualified `<agent>/<skill>` key still works (back-compat)", () => {
    expect(isStale(verifyAgentFreshness(m, { "svc/chat": DRIFTED }))).toBe(true);
  });

  test("qualified WINS over bare when both are present (precedence)", () => {
    expect(verifyAgentFreshness(m, { "svc/chat": SERVED, chat: DRIFTED }).filter((f) => f.code === "stale-skill")).toEqual([]);
  });
});
