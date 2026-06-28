/**
 * The BINDER (C038): authored .feature steps → contract handles, plus the bidirectional, tri-state GAP report.
 *
 * The decision rule is EXACT-or-UNBOUND and statically decidable:
 *   - A step's skeleton equals a generated step skeleton → BOUND to that single stable handle.
 *   - Outcome (THEN) steps are resolved RELATIVE to the scenario's WHEN-subject (the operation the scenario is about),
 *     not via a global phrase→handle map — otherwise a generic "Then it succeeds" (shared by ~every op) mis-binds to
 *     an arbitrary one. This subject-relative rule is the spike-witnessed correction on the toolfactory contract.
 *   - Otherwise the step is UNBOUND, then DETERMINISTICALLY classified into a tri-state for a human:
 *       PARAPHRASE (an author-owned alias resolves it — no dev), NEEDS-DEV-GLUE (an operation exists but no step wires
 *       it), NEEDS-CONTRACT (nothing backs the intent — a dev extends the contract).
 *   - A WHEN phrase shared by >1 operation is AMBIGUOUS (a disambiguation the projector must resolve).
 *
 * No scoring/lemmatization/embedding EVER decides a bind. Token similarity appears ONLY to rank the presentational
 * "did you mean?" suggestion on an already-UNBOUND step.
 */
import { camel, jaccard, norm, tok } from "./normalize";
import type { FeatureStep, Feature } from "./gherkin";
import type { JourneyStep, Vocabulary } from "./vocabulary";

export type BindState = "BOUND" | "PARAPHRASE" | "NEEDS-DEV-GLUE" | "NEEDS-CONTRACT" | "AMBIGUOUS";

export interface StepResult {
  step: FeatureStep;
  state: BindState;
  /** the bound (or suggested) handle, when there is one. */
  handle: string;
  /** provenance of a BOUND step. */
  via: string;
  /** a human next-action for a non-BOUND step. */
  suggest: string;
}

export interface ScenarioResult {
  scenario: string;
  rule?: string;
  /** the resolved subject operation handle (the scenario's When-op), if any. */
  subject: string;
  results: StepResult[];
}

export interface CoverageHole {
  handle: string;
  name: string;
  /** a one-line drop-in stub scenario to cover this operation. */
  stub: string;
}

export interface GapReport {
  scenarios: ScenarioResult[];
  counts: Record<BindState, number>;
  coverage: {
    total: number;
    covered: number;
    holes: CoverageHole[];
  };
}

export interface BindOptions {
  /** an author-owned synonym map: normalized authored skeleton → a canonical generated skeleton. Resolves PARAPHRASE without a dev. */
  aliases?: Record<string, string>;
  /** how many coverage-hole stubs to emit (default: all). */
  maxHoles?: number;
}

interface Indexes {
  whenBySkeleton: Map<string, JourneyStep[]>;
  thenByHandle: Map<string, Set<string>>;
  givenSkeletons: Set<string>;
  whenSteps: JourneyStep[];
}

function buildIndexes(vocab: Vocabulary): Indexes {
  const whenBySkeleton = new Map<string, JourneyStep[]>();
  const thenByHandle = new Map<string, Set<string>>();
  const givenSkeletons = new Set<string>();
  const whenSteps: JourneyStep[] = [];
  for (const s of vocab.steps) {
    if (s.kind === "given") givenSkeletons.add(s.skeleton);
    else if (s.kind === "when") {
      (whenBySkeleton.get(s.skeleton) ?? whenBySkeleton.set(s.skeleton, []).get(s.skeleton)!).push(s);
      whenSteps.push(s);
    } else {
      (thenByHandle.get(s.handle) ?? thenByHandle.set(s.handle, new Set()).get(s.handle)!).add(s.skeleton);
    }
  }
  return { whenBySkeleton, thenByHandle, givenSkeletons, whenSteps };
}

const res = (step: FeatureStep, state: BindState, handle = "", via = "", suggest = ""): StepResult => ({ step, state, handle, via, suggest });

function classifyUnbound(step: FeatureStep, vocab: Vocabulary, idx: Indexes): StepResult {
  const st = tok(step.text);
  // best WHEN phrase (paraphrase suggestion) — presentational only.
  let best: { s: JourneyStep; score: number } | null = null;
  for (const w of idx.whenSteps) {
    const score = jaccard(st, tok(w.phrase));
    if (!best || score > best.score) best = { s: w, score };
  }
  if (best && best.score >= 0.6) return res(step, "PARAPHRASE", best.s.handle, "", `try "${best.s.phrase}" — or add it to your alias map (no dev)`);
  // does any operation relate? (a real op exists, but no generated phrase matches the author's wording)
  let opBest: { op: { handle: string; name: string; method: string; path: string }; score: number } | null = null;
  for (const op of vocab.operations) {
    const score = jaccard(st, tok(camel(op.name)));
    if (!opBest || score > opBest.score) opBest = { op, score };
  }
  if (opBest && opBest.score >= 0.34) return res(step, "NEEDS-DEV-GLUE", opBest.op.handle, "", `relates to '${opBest.op.name}' (${opBest.op.method.toUpperCase()} ${opBest.op.path}) — wire or alias a step`);
  return res(step, "NEEDS-CONTRACT", "", "", "no operation backs this intent — a developer adds it to the contract");
}

function bindStep(step: FeatureStep, subject: string, vocab: Vocabulary, idx: Indexes, aliases: Record<string, string>): StepResult {
  let skel = norm(`${step.kind} ${step.text}`); // resolved keyword (And/But already folded by the parser)
  if (aliases[skel]) skel = aliases[skel]; // author-owned alias layer (presentational; never widens the matcher)

  if (step.kind === "given") {
    if (idx.givenSkeletons.has(skel)) return res(step, "BOUND", "@access:authenticated", "x-suluk-access");
    return classifyUnbound(step, vocab, idx);
  }
  if (step.kind === "when") {
    const hit = idx.whenBySkeleton.get(skel);
    if (hit && hit.length === 1) return res(step, "BOUND", hit[0].handle, hit[0].via);
    if (hit && hit.length > 1) return res(step, "AMBIGUOUS", "", "", `${hit.length} operations render this phrase — the projector must disambiguate`);
    return classifyUnbound(step, vocab, idx);
  }
  // THEN — bind relative to the scenario subject.
  const thens = idx.thenByHandle.get(subject);
  if (thens?.has(skel)) return res(step, "BOUND", subject, "outcome of the scenario's When-subject");
  return classifyUnbound(step, vocab, idx);
}

/** Bind a parsed feature set against the vocabulary and produce the bidirectional gap report. */
export function bindFeatures(vocab: Vocabulary, features: Feature[], opts: BindOptions = {}): GapReport {
  const idx = buildIndexes(vocab);
  const aliases = opts.aliases ?? {};
  const scenarios: ScenarioResult[] = [];
  const counts: Record<BindState, number> = { BOUND: 0, PARAPHRASE: 0, "NEEDS-DEV-GLUE": 0, "NEEDS-CONTRACT": 0, AMBIGUOUS: 0 };
  const coveredWhen = new Set<string>();

  for (const feat of features) {
    for (const sc of feat.scenarios) {
      // subject = the first When-step that binds to exactly one operation.
      let subject = "";
      for (const step of sc.steps) {
        if (step.kind !== "when") continue;
        const hit = idx.whenBySkeleton.get(norm(`when ${step.text}`));
        if (hit && hit.length === 1) {
          subject = hit[0].handle;
          break;
        }
      }
      const results = sc.steps.map((step) => {
        const r = bindStep(step, subject, vocab, idx, aliases);
        counts[r.state]++;
        if (r.state === "BOUND" && step.kind === "when") coveredWhen.add(r.handle);
        return r;
      });
      scenarios.push({ scenario: sc.name, rule: sc.rule, subject, results });
    }
  }

  // direction (ii): contract → authored coverage holes.
  const whenByHandle = new Map(idx.whenSteps.map((s) => [s.handle, s]));
  const holesAll = vocab.operations.filter((op) => !coveredWhen.has(op.handle));
  const holes: CoverageHole[] = holesAll.slice(0, opts.maxHoles ?? holesAll.length).map((op) => {
    const when = whenByHandle.get(op.handle);
    const given = op.access === "authenticated" ? "    Given I am a signed-in user\n" : "";
    return { handle: op.handle, name: op.name, stub: `  Scenario: cover ${op.name}\n${given}    ${when?.phrase ?? "When I " + camel(op.name)}\n    Then it succeeds` };
  });

  return { scenarios, counts, coverage: { total: vocab.operations.length, covered: vocab.operations.length - holesAll.length, holes } };
}

/** Render the gap report as readable text (for a CLI / a download endpoint). */
export function renderGapReport(report: GapReport): string {
  const TAG: Record<BindState, string> = { BOUND: "✓ BOUND", PARAPHRASE: "≈ PARAPHRASE", "NEEDS-DEV-GLUE": "⚙ NEEDS-DEV-GLUE", "NEEDS-CONTRACT": "✗ NEEDS-CONTRACT", AMBIGUOUS: "⚠ AMBIGUOUS" };
  const out: string[] = [];
  for (const sc of report.scenarios) {
    out.push(`\n  Scenario: ${sc.scenario}${sc.rule ? `   (Rule: ${sc.rule})` : ""}`);
    for (const r of sc.results) {
      out.push(`    ${r.step.kind.toUpperCase().padEnd(5)} ${r.step.text}`);
      out.push(`          → ${TAG[r.state]}${r.handle ? `  [${r.handle}]` : ""}`);
      if (r.suggest) out.push(`            ↳ ${r.suggest}`);
    }
  }
  out.push(`\n  GAP SUMMARY  ${Object.entries(report.counts).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("   ")}`);
  out.push(`  COVERAGE  ${report.coverage.covered}/${report.coverage.total} operations covered; ${report.coverage.holes.length} stub(s) below.`);
  for (const h of report.coverage.holes) out.push(h.stub);
  return out.join("\n");
}
