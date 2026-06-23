/**
 * AGENT HARDENING GRADE (C027, Stage 1.3) — score an agent's health A–F and gate CI on it, the same way `@suluk/harden`
 * scores a document's INPUT surface. It does NOT re-derive any check: it AGGREGATES the checks this package already
 * ships — the install lint (`lintAgents`), the context-budget/model-fit analyzer (`contextReport`), and (when a served
 * fact is supplied) the over-serve / cold-tail-in-default / skill-freshness conformance auditors — plus two small
 * static STRUCTURE checks the others don't cover (no-tiering, fully-unpinned skill). One number + one CI gate so the
 * agent-composition facets become load-bearing rather than decorative.
 *
 * Boundary: pure + static by default (no network, no runtime). Conformance/freshness fold in ONLY when the caller
 * passes the served names / snapshots — exactly like `@suluk/harden`'s optional `ignore`. Tool-INPUT hardening (an
 * agent's tools are operations) stays `@suluk/harden`'s job; this grade is the agent-COMPOSITION dimension.
 *
 * THE RUBRIC (transparent + two clean regimes, F reserved for un-shippable):
 *   - score = 100 − Σ penalty(finding), penalty: error 40 · warning 12 · info 0 (info = advisory note, never scored,
 *     so the grade never penalizes the agent for a CALLER's missing input).
 *   - ANY error-severity finding ⇒ score capped at 39 ⇒ grade F (a ship-blocking defect: it can't go out). The
 *     error weight (40) is intentionally redundant with this cap — kept only so the depressed number is visible.
 *   - With NO error, warnings alone NEVER drop below 40 (D). So F means EXACTLY "has a ship-blocking error"; warnings
 *     range A→D. This keeps the letter unambiguous for a CI consumer (and for Stage-1.5).
 *
 * Stage-1.5 unification: `gradeOf` mirrors `@suluk/harden`'s letter thresholds so a unified "contract grade" can
 * combine the two — but on the LETTER (ordinal), not the raw score: harden scores a clean/nodes RATIO (size-normalized)
 * while this scores absolute 100−Σpenalty, so the cardinal numbers are NOT directly comparable.
 */
import type { OpenAPIv4Document } from "@suluk/core";
import type { ModelCatalog } from "@suluk/models";
import { agentMap, resolveOperationRef, resolveSnapshot } from "./resolve";
import { lintAgents, type LintFinding } from "./lint";
import { contextReport, type ContextReport, type UnflattenSuggestion } from "./context";
import { assertServedSubset, assertDefaultServedResident, verifySkillFreshness } from "./conformance";

export type AgentGrade = "A" | "B" | "C" | "D" | "F";
export type GradeDimension = "lint" | "context" | "structure" | "conformance" | "freshness";
export type GradeSeverity = "error" | "warning" | "info";

export interface AgentGradeFinding {
  dimension: GradeDimension;
  severity: GradeSeverity;
  /** machine code (carried through from the source check, e.g. "missing-max-depth", "no-fitting-model", "no-tiering"). */
  code: string;
  detail: string;
  /** a concrete remedy where the source check (or this one) provides one. */
  fix?: string;
}

export interface AgentGradeReport {
  agent: string;
  score: number; // 0–100
  grade: AgentGrade;
  /**
   * false ⇒ at least one ship-blocking ERROR-severity finding (ANY dimension) — the grade is then capped at F.
   * NB this is broader than lint-installability: an agent that installs perfectly but is SERVED wrong (over-serve /
   * cold-tail-in-default) or whose preprompt DRIFTED (stale-skill) is also not shippable. `grade === "F" ⟺ !shippable`.
   */
  shippable: boolean;
  findings: AgentGradeFinding[];
  bySeverity: Record<GradeSeverity, number>;
  byDimension: Record<GradeDimension, AgentGradeFinding[]>;
  /** the existing inverse-fix pointers for the context dimension (which resident tools to push to cold-tail). */
  suggestions: UnflattenSuggestion[];
}

export interface AgentGradeOptions {
  /** instruction snapshots keyed `"<agent>/<skill>"` — lets the context analyzer MEASURE instruction load (else lower-bound). */
  instructions?: Record<string, string>;
  /** the @suluk/models catalog — enables the model-fit dimension (window vs estimated peak load). */
  catalog?: ModelCatalog;
  /** per-id context-window overrides (tests/pins; takes precedence over the catalog). */
  modelWindows?: Record<string, number>;
  /** the tools a server actually advertises by default — folds in the over-serve + cold-tail-in-default conformance checks. */
  served?: string[];
  /** the CURRENT served instruction snapshot, keyed qualified `"<agent>/<skill>"` (wins) OR bare `"<skill>"` (back-compat) — same dual-accept as `instructions` + `verifyAgentFreshness`; folds in the skill-freshness (drift) check. */
  snapshots?: Record<string, string>;
}

/** harden's letter thresholds, mirrored so the two grades share one ORDINAL scale (Stage 1.5 combines LETTERS). */
export function gradeOf(score: number): AgentGrade {
  return score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
}

const ORDER: AgentGrade[] = ["F", "D", "C", "B", "A"];
const PENALTY: Record<GradeSeverity, number> = { error: 40, warning: 12, info: 0 };
const NO_TIERING_MIN_ROUTES = 8; // ≥ this many own routes with ZERO cold-tail ⇒ the tier-trim is unused
const MUTATING = new Set(["post", "put", "patch", "delete"]);

/** Static STRUCTURE checks the lint/context/conformance passes don't cover (tiering, unpinned skills, HITL on mutations). */
function structureFindings(doc: OpenAPIv4Document, agentName: string): AgentGradeFinding[] {
  const agent = agentMap(doc)[agentName];
  if (!agent) return [];
  const out: AgentGradeFinding[] = [];
  const routes = Object.entries(agent.routes ?? {});
  const coldTail = routes.filter(([, r]) => r.tier === "cold-tail").length;
  if (routes.length >= NO_TIERING_MIN_ROUTES && coldTail === 0)
    out.push({
      dimension: "structure", severity: "warning", code: "no-tiering",
      detail: `${routes.length} routes, none cold-tail — the whole tool surface loads on every inference (the tier-trim context reduction is unused)`,
      fix: "mark rarely-used routes `tier: \"cold-tail\"` so they sit behind discover_tools",
    });
  // HITL (Stage 1.4): an UNTRUSTED tier that can invoke a MUTATING operation with no human-approval gate is a real
  // blast-radius risk — an autonomous, untrusted LLM running a consequential write unattended. (Trusted tiers are a
  // deliberate policy choice → not flagged; declare `x-suluk-approval: { required: true }` on the operation to gate.)
  // NB per-agent-LOCAL: this inspects the agent's OWN routes, not its transitive sub-agent surface (each sub-agent is
  // graded on its own — gradeAgents rolls them up). An untrusted PARENT delegating a mutation to a child is the child's finding.
  if (agent.trustBoundary === "untrusted") {
    for (const [rk, r] of routes) {
      const req = resolveOperationRef(doc, r.operationRef)?.request;
      if (req && MUTATING.has(req.method.toLowerCase()) && !req["x-suluk-approval"]?.required)
        out.push({
          dimension: "structure", severity: "warning", code: "untrusted-mutation-no-approval",
          detail: `untrusted tier can invoke mutating tool "${rk}" (${req.method.toUpperCase()}) with no human-approval gate`,
          fix: "declare `x-suluk-approval: { required: true }` on the operation (projects to the Agents SDK needsApproval)",
        });
    }
  }
  for (const [sk, skill] of Object.entries(agent.skills ?? {})) {
    if (!skill.provenance)
      out.push({
        dimension: "structure", severity: "warning", code: "skill-unpinned",
        detail: `skill "${sk}" declares no provenance — its served instructions can't be content-hashed, signed, or drift-checked`,
        fix: "add provenance { source, contentHash } so freshness + signing can bind (see verifyAgentFreshness)",
      });
  }
  return out;
}

/** Score ONE agent from PRE-COMPUTED whole-doc passes (so the rollup doesn't recompute them per agent). */
function scoreAgent(doc: OpenAPIv4Document, agentName: string, opts: AgentGradeOptions, lintAll: LintFinding[], ctx: ContextReport): AgentGradeReport {
  const findings: AgentGradeFinding[] = [];

  // 1. LINT — the install gate (acyclicity, depth, dangling refs, D1 selector red-line, scope escalation, thinking bound).
  for (const f of lintAll.filter((f) => f.agent === agentName))
    findings.push({ dimension: "lint", severity: f.severity, code: f.code, detail: f.at ? `${f.detail} (at ${f.at})` : f.detail });

  // 2. CONTEXT — budget / model-fit / overload (model-fit only when a catalog/windows were supplied).
  for (const f of ctx.findings.filter((f) => f.agent === agentName))
    findings.push({ dimension: "context", severity: f.severity, code: f.code, detail: f.detail });
  const suggestions = ctx.suggestions.filter((s) => s.agent === agentName);

  // 3. STRUCTURE — the two checks not covered above.
  findings.push(...structureFindings(doc, agentName));

  // 4. CONFORMANCE (served-fact) — over-serve + cold-tail-in-default, only when the served set is supplied.
  if (opts.served) {
    for (const f of assertServedSubset(doc, agentName, opts.served))
      findings.push({ dimension: "conformance", severity: f.severity, code: f.code, detail: f.detail, fix: "serve only the declared reachable surface (discover_tools may reorder/lazy-load, never widen)" });
    for (const f of assertDefaultServedResident(doc, agentName, opts.served))
      findings.push({ dimension: "conformance", severity: f.severity, code: f.code, detail: f.detail, fix: "withhold cold-tail tools from the default tools/list (reveal via discover_tools)" });
  }

  // 5. FRESHNESS (served-fact) — drift between a skill's pinned contentHash and the current served snapshot. We keep
  // only the load-bearing `stale-skill` ERROR; the `unpinned-skill` warning is dropped here because the
  // structure/skill-unpinned (no provenance) and lint/skill-provenance-unpinned (no hash) checks already own that
  // defect — re-charging it would double-penalize one root cause AND make the score depend on whether the caller
  // happened to pass a snapshot (the header's "never penalize for caller input" guarantee).
  if (opts.snapshots) {
    const agent = agentMap(doc)[agentName];
    for (const [sk, skill] of Object.entries(agent.skills ?? {})) {
      const snap = resolveSnapshot(opts.snapshots, agentName, sk);
      if (snap === undefined) continue;
      for (const f of verifySkillFreshness(skill.provenance?.contentHash, snap)) {
        if (f.code === "unpinned-skill") continue; // redundant with structure/lint — see note above
        findings.push({ dimension: "freshness", severity: f.severity, code: f.code, detail: `skill "${sk}": ${f.detail}`, fix: "re-pin provenance.contentHash to the current served snapshot (or re-sign the manifest)" });
      }
    }
  }

  // dedupe a finding that two passes emit for the same root cause at the same locus (harden dedupes by rule@path).
  const seen = new Set<string>();
  const deduped = findings.filter((f) => { const k = `${f.dimension}:${f.code}:${f.detail}`; if (seen.has(k)) return false; seen.add(k); return true; });

  // score: 100 − Σ penalty; ANY error caps at F (≤39); with no error, warnings never drop below 40 (D).
  const bySeverity: Record<GradeSeverity, number> = { error: 0, warning: 0, info: 0 };
  for (const f of deduped) bySeverity[f.severity]++;
  const shippable = bySeverity.error === 0;
  let score = Math.max(0, 100 - deduped.reduce((n, f) => n + PENALTY[f.severity], 0));
  if (!shippable) score = Math.min(score, 39);            // error ⇒ F
  else if (bySeverity.warning > 0) score = Math.max(score, 40); // warnings alone never below D — F is reserved for errors

  const byDimension: Record<GradeDimension, AgentGradeFinding[]> = { lint: [], context: [], structure: [], conformance: [], freshness: [] };
  for (const f of deduped) byDimension[f.dimension].push(f);

  return { agent: agentName, score, grade: gradeOf(score), shippable, findings: deduped, bySeverity, byDimension, suggestions };
}

const ctxOpts = (opts: AgentGradeOptions) => ({ instructions: opts.instructions, catalog: opts.catalog, modelWindows: opts.modelWindows });

/** Grade ONE agent A–F by aggregating the package's existing checks (+ two structure checks). Pure & static by default. */
export function gradeAgent(doc: OpenAPIv4Document, agentName: string, opts: AgentGradeOptions = {}): AgentGradeReport {
  if (!agentMap(doc)[agentName]) throw new Error(`@suluk/agents: no agent "${agentName}" in x-suluk-agents`);
  return scoreAgent(doc, agentName, opts, lintAgents(doc), contextReport(doc, ctxOpts(opts)));
}

/** Grade EVERY agent in the document (weakest first) — the rollup. Computes the whole-doc passes ONCE (not per agent). */
export function gradeAgents(doc: OpenAPIv4Document, opts: AgentGradeOptions = {}): AgentGradeReport[] {
  const lintAll = lintAgents(doc);
  const ctx = contextReport(doc, ctxOpts(opts));
  return Object.keys(agentMap(doc)).map((name) => scoreAgent(doc, name, opts, lintAll, ctx)).sort((a, b) => a.score - b.score);
}

/** True ⇒ the agent's grade is at least `min`. */
export const agentGradeOk = (report: AgentGradeReport, min: AgentGrade): boolean => ORDER.indexOf(report.grade) >= ORDER.indexOf(min);

/**
 * CI GATE (the hard incentive, mirrors `@suluk/harden`'s assertGrade): throw if the agent's grade is below `min`.
 * Returns the report on pass, so a test can additionally assert on it.
 */
export function assertAgentGrade(doc: OpenAPIv4Document, agentName: string, min: AgentGrade, opts: AgentGradeOptions = {}): AgentGradeReport {
  const r = gradeAgent(doc, agentName, opts);
  if (!agentGradeOk(r, min)) {
    const worst = r.findings.filter((f) => f.severity === "error").concat(r.findings.filter((f) => f.severity === "warning")).slice(0, 5).map((f) => `${f.code} (${f.dimension})`).join(", ");
    throw new Error(`@suluk/agents: agent "${agentName}" grade ${r.grade} (${r.score}/100) is below the required ${min}. ${r.bySeverity.error} error · ${r.bySeverity.warning} warning findings${worst ? `. Worst: ${worst}` : ""}.${r.shippable ? "" : " Has a ship-blocking error → capped at F."}`);
  }
  return r;
}
