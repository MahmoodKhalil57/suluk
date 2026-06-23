/**
 * THE AGENT PYRAMID (C035) — view the `x-suluk-agents` composition as DETERMINISM LAYERS, and fold the per-layer
 * static observability the operator asked for (hardening · token-budget · context-waste) into ONE surface.
 *
 * The pyramid is not a new construct — it is the SHIPPED route(no-model)/skill(model) discriminator (C027) made
 * vertical:
 *   - LEVEL 0 (the deterministic FLOOR): `routes` — by-name `operationRef`s into existing operations, NO model,
 *     `guarantee: same-in-same-out`. These project to MCP tools (the "calculators"): hard to use, trivial to verify.
 *   - LEVEL k: an agent = `skills` (model-bearing) + `routes` (floor) + `sub-agents` (lower levels). Composition
 *     height = how far above the floor it sits. Higher ⇒ less deterministic, more general, more "convenient".
 *
 * An agent's LEVEL is a PURE STATIC derivation over the composition graph (it reuses `subtreeDepth`); it is DECLARED,
 * never schema-enforced, and is NEVER read by the D1 request→operation matcher (no field here touches request data).
 *
 * `layerReport` is a COMPOSITION, not a new mechanism (the C035 ledger says so): hardening reuses `gradeAgent`,
 * token-budget + context-waste reuse `contextReport`. Pure + static (no network, no runtime).
 */
import type { OpenAPIv4Document } from "@suluk/core";
import { agentMap, subtreeDepth, resolveOperationRef } from "./resolve";
import { gradeAgents, type AgentGrade, type AgentGradeOptions } from "./grade";
import { contextReport, type AgentContextLoad, type UnflattenSuggestion } from "./context";

/** Routes — the deterministic floor — sit at level 0. The lowest an orchestrating agent can sit is level 1. */
export const FLOOR_LEVEL = 0;

/**
 * An agent's pyramid LEVEL: its composition height above the deterministic route-floor. A leaf agent (skills/routes
 * only, no sub-agents) is **1** (it composes only the floor). An agent that composes sub-agents is **1 + max(child
 * level)**. Returns `FLOOR_LEVEL` (0) for any name that is NOT an orchestrating agent (a route/leaf capability — it
 * lives on the floor). Returns `Infinity` when a sub-agent cycle makes the height unbounded (a contract defect the
 * cycle-linter / grade already fail on). Cycle-safe via the shared `subtreeDepth` seen-guard. Never read by D1.
 */
export function agentLevel(doc: OpenAPIv4Document, name: string): number {
  const map = agentMap(doc);
  if (!map[name]) return FLOOR_LEVEL;
  const depth = subtreeDepth(map, name); // leaf = 0; Infinity on a reachable cycle
  return depth === Infinity ? Infinity : depth + 1;
}

/** One agent's row in the pyramid view: where it sits + what it composes + the three static-observability signals. */
export interface AgentLayer {
  agent: string;
  /** composition height above the floor; a leaf agent = 1. `-1` ⇒ cyclic (see `cyclic`) so the row stays JSON-safe. */
  level: number;
  /** true ⇒ a reachable sub-agent cycle makes the level unbounded — a defect the cycle-linter / grade fail on. */
  cyclic: boolean;
  /** level-0 deterministic capabilities composed directly (the calculators). */
  routeCount: number;
  /** model-bearing tiers — the agent's internal AI. `0` ⇒ a deterministic composition agent (closer to the floor). */
  skillCount: number;
  /** higher-layer units composed (by-name sub-agent refs). */
  subAgentCount: number;
  // ── per-layer static observability (reuses shipped infra; present when computed) ──
  /** HARDENING — `gradeAgent` A–F. */
  grade?: AgentGrade;
  shippable?: boolean;
  /** estimated default context load (tokens) — `contextReport`. */
  contextTokens?: number;
  /** the agent's DECLARED `contextBudget.tokens`, if any. */
  budget?: number;
  /** TOKEN WARNING — the estimate exceeds the declared budget. */
  overBudget?: boolean;
  /** CONTEXT-WASTE WARNING — resident tools the analyzer says should move to cold-tail, and the tokens that frees. */
  contextWaste?: { moveToColdTail: string[]; wouldSaveTokens: number };
}

export interface LayerReport {
  /** one row per agent, sorted by (level asc, then name). */
  layers: AgentLayer[];
  /** level → agent names at that level (cyclic agents are grouped under `-1`). */
  byLevel: Record<number, string[]>;
  /** the tallest FINITE agent level (0 when there are no agents). */
  maxLevel: number;
  /** the distinct route `operationRef`s forming the deterministic floor across all agents (level 0). */
  floor: string[];
}

/**
 * Build the whole-document pyramid view. Folds, for every agent: its static LEVEL + composition counts, plus the
 * three observability signals the operator asked for — hardening (`gradeAgent`), token-budget and context-waste
 * (`contextReport`). Pure + static. `opts` is the SAME options bag `gradeAgent` takes (instructions / catalog /
 * modelWindows / served / snapshots); pass what you have and the richer columns fill in, omit it for the structure.
 */
export function layerReport(doc: OpenAPIv4Document, opts: AgentGradeOptions = {}): LayerReport {
  const map = agentMap(doc);
  const names = Object.keys(map);

  // reuse shipped analyzers — no re-derivation (the C035 "composition, not a new mechanism" claim).
  const grades = new Map(gradeAgents(doc, opts).map((g) => [g.agent, g]));
  const ctx = contextReport(doc, opts);
  const loads = new Map<string, AgentContextLoad>(ctx.loads.map((l) => [l.agent, l]));
  const waste = new Map<string, UnflattenSuggestion>(ctx.suggestions.map((s) => [s.agent, s]));

  const floorSet = new Set<string>();
  for (const a of Object.values(map)) for (const r of Object.values(a.routes ?? {})) floorSet.add(r.operationRef);

  const layers: AgentLayer[] = names.map((agent) => {
    const a = map[agent]!;
    const lvl = agentLevel(doc, agent);
    const cyclic = !Number.isFinite(lvl);
    const g = grades.get(agent);
    const load = loads.get(agent);
    const w = waste.get(agent);
    const budget = a.contextBudget?.tokens;
    return {
      agent,
      level: cyclic ? -1 : lvl,
      cyclic,
      routeCount: Object.keys(a.routes ?? {}).length,
      skillCount: Object.keys(a.skills ?? {}).length,
      subAgentCount: Object.keys(a.agents ?? {}).length,
      ...(g ? { grade: g.grade, shippable: g.shippable } : {}),
      ...(load ? { contextTokens: load.totalTokens } : {}),
      ...(budget !== undefined ? { budget } : {}),
      // the binding basis is PEAK (totalTokens + thinking round-accretion) — same as contextReport's context-over-budget
      // finding (context.ts) — so a multi-round thinker the analyzer flags isn't silently reported as under-budget here.
      ...(budget !== undefined && load ? { overBudget: load.peakTokens > budget } : {}),
      ...(w && w.moveToColdTail.length ? { contextWaste: { moveToColdTail: w.moveToColdTail, wouldSaveTokens: w.wouldSaveTokens } } : {}),
    };
  });

  layers.sort((x, y) => x.level - y.level || x.agent.localeCompare(y.agent));

  const byLevel: Record<number, string[]> = {};
  for (const l of layers) (byLevel[l.level] ??= []).push(l.agent);
  const maxLevel = layers.reduce((m, l) => (l.cyclic ? m : Math.max(m, l.level)), 0);

  return { layers, byLevel, maxLevel, floor: [...floorSet].filter((ref) => resolveOperationRef(doc, ref) !== null).sort() };
}
