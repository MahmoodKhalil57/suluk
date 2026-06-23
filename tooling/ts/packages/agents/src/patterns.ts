/**
 * AGENTIC-PATTERN AFFORDANCES (C035 follow-up) — name which of the canonical agentic patterns an agent's
 * COMPOSITION SHAPE can express, mapped to Cloudflare/Anthropic's vocabulary (prompt-chaining, routing,
 * parallelization, orchestrator-workers, evaluator-optimizer).
 *
 * HARD HONESTY BOUNDARY (C029): the loop TRAJECTORY — which pattern an agent actually runs, when each round stops —
 * is runtime-opaque BY DESIGN (Suluk deliberately has no stopCondition / control-flow vocabulary a generator could
 * only echo). So this NEVER claims an agent "does" a pattern. It reports a STRUCTURAL AFFORDANCE: the shape the
 * declaration AFFORDS. Every result carries `advisory: true`. Pure + static; never read by the D1 matcher.
 *
 * The structural signals (conservative — a shape affords a pattern, the runtime picks one):
 *   - `thinking.maxRounds >= 2`        → evaluator-optimizer (an iterative generate→evaluate→refine envelope)
 *   - exactly 1 sub-agent              → prompt-chaining (a linear pipe: this stage's output feeds the next)
 *   - >= 2 sub-agents + >= 1 skill     → orchestrator-workers · parallelization · routing (a model-bearing
 *                                        coordinator over multiple downstream units; WHICH one is the runtime choice)
 */
import type { OpenAPIv4Document } from "@suluk/core";
import { agentMap } from "./resolve";

export type AgenticPattern =
  | "prompt-chaining"
  | "routing"
  | "parallelization"
  | "orchestrator-workers"
  | "evaluator-optimizer";

export interface PatternAffordance {
  pattern: AgenticPattern;
  /** the STATIC signal in the composition that affords it. */
  rationale: string;
  /** ALWAYS true — a structural capability, NEVER a claim the runtime executes the pattern (C029: trajectory is opaque). */
  advisory: true;
}

/**
 * The agentic patterns an agent's composition SHAPE affords (advisory; the runtime picks the actual trajectory).
 * Returns `[]` for a flat agent (no sub-agents, no multi-round thinking) — a single-step tool-user affords none of
 * the multi-step patterns. Unknown agent name ⇒ `[]`.
 */
export function agenticPatterns(doc: OpenAPIv4Document, name: string): PatternAffordance[] {
  const agent = agentMap(doc)[name];
  if (!agent) return [];

  const subAgentCount = Object.keys(agent.agents ?? {}).length;
  const skillCount = Object.keys(agent.skills ?? {}).length;
  const maxRounds = agent.thinking?.maxRounds ?? 0;

  const out: PatternAffordance[] = [];
  const add = (pattern: AgenticPattern, rationale: string) => out.push({ pattern, rationale, advisory: true });

  if (maxRounds >= 2)
    add("evaluator-optimizer", `a thinking envelope of ${maxRounds} rounds affords a generate→evaluate→refine loop`);

  if (subAgentCount === 1)
    add("prompt-chaining", "exactly one sub-agent — a linear pipe where this stage's output feeds the next");

  if (subAgentCount >= 2 && skillCount >= 1) {
    add("orchestrator-workers", `a model-bearing coordinator over ${subAgentCount} sub-agents — it can decompose work and delegate`);
    add("parallelization", `${subAgentCount} independent sub-agents — the work can be sectioned or voted across them`);
    add("routing", `${subAgentCount} downstream units under a model — it can classify input and dispatch to one`);
  }

  return out;
}

/** Convenience: just the pattern names an agent's shape affords (advisory). */
export function affordedPatterns(doc: OpenAPIv4Document, name: string): AgenticPattern[] {
  return agenticPatterns(doc, name).map((a) => a.pattern);
}
