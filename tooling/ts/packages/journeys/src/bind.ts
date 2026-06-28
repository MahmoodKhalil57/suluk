/**
 * The BINDER (C038): authored .feature steps → contract handles, the bidirectional tri-state GAP report, plus the
 * TWO-ROLE authoring layer (a definitions/decomposition map + undefined detection) and named-journey COMPOSITION.
 *
 * The decision rule is EXACT-or-UNBOUND and statically decidable:
 *   - A step's skeleton equals a generated step skeleton → BOUND to that single stable handle.
 *   - Outcome (THEN) steps resolve relative to the MOST-RECENT bound WHEN (the action currently in play) — so a generic
 *     "Then it succeeds" never mis-binds, AND a multi-step / composed journey binds each outcome to its own action.
 *   - Otherwise the step is UNBOUND, then DETERMINISTICALLY classified for a human: PARAPHRASE (an alias resolves it,
 *     no dev), NEEDS-DEV-GLUE (an operation exists but no step wires it), NEEDS-CONTRACT (nothing backs it — a dev
 *     extends the contract). A WHEN phrase shared by >1 operation is AMBIGUOUS; a ref to an undefined journey is UNDEFINED.
 *
 * TWO ROLES (no developer for either): a NON-TECHNICAL author writes stories in their own words; a SCAFFOLDER maps that
 * free prose onto the runnable vocabulary via a `Definitions` artifact — an ALIAS (prose → one canonical step), a
 * DECOMPOSITION (prose → a sequence of canonical steps), or a named JOURNEY (composed by reference). `detectUndefined`
 * tells the scaffolder exactly what is not yet runnable, and whether they can define it or must escalate to a developer.
 *
 * No scoring/lemmatization/embedding EVER decides a bind. Token similarity appears ONLY to rank the presentational
 * "did you mean?" suggestion on an already-UNBOUND step.
 */
import { camel, jaccard, norm, tok } from "./normalize";
import type { FeatureStep, Feature, StepKind } from "./gherkin";
import type { JourneyStep, Vocabulary } from "./vocabulary";

export type BindState = "BOUND" | "PARAPHRASE" | "NEEDS-DEV-GLUE" | "NEEDS-CONTRACT" | "AMBIGUOUS" | "UNDEFINED";

/**
 * The SCAFFOLDER's mapping layer (author-owned data, no developer). Turns a non-technical author's free prose into
 * runnable Gherkin without touching code.
 */
export interface Definitions {
  /** a free-prose step (normalized) → a canonical generated phrase (ALIAS) OR an ordered list of canonical phrases
   *  (manual DECOMPOSITION). Each canonical phrase carries its keyword, e.g. "When I checkout" / "Then it succeeds". */
  steps?: Record<string, string | string[]>;
  /** named JOURNEYS for composition: a journey name → an ordered list of step phrases (each itself bound or defined).
   *  Referenced from a story with `When I complete the "<name>" journey`. */
  journeys?: Record<string, string[]>;
}

export interface StepResult {
  step: FeatureStep;
  state: BindState;
  /** the bound (or suggested) handle, when there is one. */
  handle: string;
  /** provenance of a BOUND step. */
  via: string;
  /** a human next-action for a non-BOUND step. */
  suggest: string;
  /** when this resolved step came from an alias/decomposition/journey expansion: the original authored prose it expanded from. */
  expandedFrom?: { text: string; line: number };
  /** the canonical step phrase this UNBOUND step most likely maps to (drives the scaffolder's alias stub). */
  canonical?: string;
}

export interface ScenarioResult {
  scenario: string;
  rule?: string;
  /** the FIRST bound When-op handle (a label/back-compat handle; outcomes bind to the most-recent When, see results). */
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
  /** shorthand for `definitions.steps` with 1:1 string values — an author-owned synonym map. Merged into definitions. */
  aliases?: Record<string, string>;
  /** the scaffolder's full mapping layer (aliases + decompositions + named journeys). */
  definitions?: Definitions;
  /** how many coverage-hole stubs to emit (default: all). */
  maxHoles?: number;
}

// ---- a step after alias/decomposition/journey expansion ----
interface ResolvedStep {
  kind: StepKind;
  text: string;
  raw: string;
  line: number;
  /** set when produced by expanding an alias / decomposition / journey. */
  origin?: { text: string; line: number };
  /** set when a journey-ref names a journey that is not defined. */
  undefinedJourney?: string;
}

interface Indexes {
  whenBySkeleton: Map<string, JourneyStep[]>;
  thenByHandle: Map<string, Set<string>>;
  givenSkeletons: Set<string>;
  whenSteps: JourneyStep[];
  whenByHandle: Map<string, JourneyStep>;
}

function buildIndexes(vocab: Vocabulary): Indexes {
  const whenBySkeleton = new Map<string, JourneyStep[]>();
  const thenByHandle = new Map<string, Set<string>>();
  const givenSkeletons = new Set<string>();
  const whenSteps: JourneyStep[] = [];
  const whenByHandle = new Map<string, JourneyStep>();
  for (const s of vocab.steps) {
    if (s.kind === "given") givenSkeletons.add(s.skeleton);
    else if (s.kind === "when") {
      (whenBySkeleton.get(s.skeleton) ?? whenBySkeleton.set(s.skeleton, []).get(s.skeleton)!).push(s);
      whenSteps.push(s);
      whenByHandle.set(s.handle, s);
    } else {
      (thenByHandle.get(s.handle) ?? thenByHandle.set(s.handle, new Set()).get(s.handle)!).add(s.skeleton);
    }
  }
  return { whenBySkeleton, thenByHandle, givenSkeletons, whenSteps, whenByHandle };
}

function mergeDefinitions(opts: BindOptions): Definitions {
  const steps: Record<string, string | string[]> = { ...opts.aliases, ...opts.definitions?.steps };
  return { steps, journeys: opts.definitions?.journeys ?? {} };
}

/** Parse 'complete the "<name>" journey' (and a couple of natural variants) → the journey name, else null. */
function journeyRefName(text: string): string | null {
  const m = /(?:complete[sd]?|run|do|perform|go through)\s+the\s+["“](.+?)["”]\s+journey/i.exec(text) || /the\s+["“](.+?)["”]\s+journey\s+(?:is|has|was)\s+(?:done|completed|complete)/i.exec(text);
  return m ? m[1].trim() : null;
}

/** Parse a canonical phrase ("When I checkout" / "And it succeeds") into a step, inheriting `last` for And/But. */
function phraseToStep(phrase: string, last: StepKind, origin: { text: string; line: number }): { step: ResolvedStep; kind: StepKind } {
  const m = /^(given|when|then|and|but)\b\s*(.*)$/i.exec(phrase.trim());
  const kw = m ? m[1].toLowerCase() : last;
  const text = m ? m[2] : phrase.trim();
  const kind: StepKind = kw === "given" || kw === "when" || kw === "then" ? (kw as StepKind) : last;
  return { step: { kind, text, raw: phrase.trim(), line: origin.line, origin }, kind };
}

function phrasesToSteps(phrases: string[], origin: { text: string; line: number }): ResolvedStep[] {
  const out: ResolvedStep[] = [];
  let last: StepKind = "given";
  for (const p of phrases) {
    const { step, kind } = phraseToStep(p, last, origin);
    last = kind;
    out.push(step);
  }
  return out;
}

/** Expand a scenario's authored steps by applying aliases / decompositions / named-journey references. */
function expandScenario(steps: FeatureStep[], defs: Definitions): ResolvedStep[] {
  const out: ResolvedStep[] = [];
  for (const s of steps) {
    const origin = { text: s.text, line: s.line };
    const jname = journeyRefName(s.text);
    if (jname) {
      const journey = defs.journeys?.[jname];
      if (journey) out.push(...phrasesToSteps(journey, origin));
      else out.push({ kind: s.kind, text: s.text, raw: s.raw, line: s.line, undefinedJourney: jname });
      continue;
    }
    const def = defs.steps?.[norm(`${s.kind} ${s.text}`)];
    if (Array.isArray(def)) out.push(...phrasesToSteps(def, origin));
    else if (typeof def === "string") out.push(phraseToStep(def, s.kind, origin).step);
    else out.push({ kind: s.kind, text: s.text, raw: s.raw, line: s.line });
  }
  return out;
}

const res = (step: FeatureStep, state: BindState, extra: Partial<StepResult> = {}): StepResult => ({ step, state, handle: "", via: "", suggest: "", ...extra });

const whenPhraseOf = (handle: string, idx: Indexes): string => idx.whenByHandle.get(handle)?.phrase ?? "";

function classifyUnbound(step: FeatureStep, vocab: Vocabulary, idx: Indexes): StepResult {
  const st = tok(step.text);
  let best: { s: JourneyStep; score: number } | null = null;
  for (const w of idx.whenSteps) {
    const score = jaccard(st, tok(w.phrase));
    if (!best || score > best.score) best = { s: w, score };
  }
  if (best && best.score >= 0.6) return res(step, "PARAPHRASE", { handle: best.s.handle, canonical: best.s.phrase, suggest: `alias to "${best.s.phrase}" (no dev)` });
  let opBest: { handle: string; name: string; method: string; path: string; score: number } | null = null;
  for (const op of vocab.operations) {
    const score = jaccard(st, tok(camel(op.name)));
    if (!opBest || score > opBest.score) opBest = { ...op, score };
  }
  if (opBest && opBest.score >= 0.34) return res(step, "NEEDS-DEV-GLUE", { handle: opBest.handle, canonical: whenPhraseOf(opBest.handle, idx), suggest: `relates to '${opBest.name}' (${opBest.method.toUpperCase()} ${opBest.path}) — define a step that maps here` });
  return res(step, "NEEDS-CONTRACT", { suggest: "no operation backs this intent — escalate to a developer to add it to the contract" });
}

function bindResolved(rs: ResolvedStep, subject: string, vocab: Vocabulary, idx: Indexes): StepResult {
  const step: FeatureStep = { kind: rs.kind, text: rs.text, raw: rs.raw, line: rs.line };
  const tag = (r: StepResult): StepResult => (rs.origin ? { ...r, expandedFrom: rs.origin } : r);
  if (rs.undefinedJourney) return tag(res(step, "UNDEFINED", { suggest: `journey "${rs.undefinedJourney}" is not defined — add it to definitions.journeys (no dev)` }));
  const skel = norm(`${rs.kind} ${rs.text}`);
  if (rs.kind === "given") {
    if (idx.givenSkeletons.has(skel)) return tag(res(step, "BOUND", { handle: "@access:authenticated", via: "x-suluk-access" }));
    return tag(classifyUnbound(step, vocab, idx));
  }
  if (rs.kind === "when") {
    const hit = idx.whenBySkeleton.get(skel);
    if (hit && hit.length === 1) return tag(res(step, "BOUND", { handle: hit[0].handle, via: hit[0].via }));
    if (hit && hit.length > 1) return tag(res(step, "AMBIGUOUS", { suggest: `${hit.length} operations render this phrase — the projector must disambiguate` }));
    return tag(classifyUnbound(step, vocab, idx));
  }
  // THEN — bind relative to the most-recent bound When subject.
  if (subject && idx.thenByHandle.get(subject)?.has(skel)) return tag(res(step, "BOUND", { handle: subject, via: "outcome of the current When-subject" }));
  return tag(classifyUnbound(step, vocab, idx));
}

/** Bind a parsed feature set against the vocabulary (applying the scaffolder's definitions) and produce the gap report. */
export function bindFeatures(vocab: Vocabulary, features: Feature[], opts: BindOptions = {}): GapReport {
  const idx = buildIndexes(vocab);
  const defs = mergeDefinitions(opts);
  const scenarios: ScenarioResult[] = [];
  const counts: Record<BindState, number> = { BOUND: 0, PARAPHRASE: 0, "NEEDS-DEV-GLUE": 0, "NEEDS-CONTRACT": 0, AMBIGUOUS: 0, UNDEFINED: 0 };
  const coveredWhen = new Set<string>();

  for (const feat of features) {
    for (const sc of feat.scenarios) {
      const resolved = expandScenario(sc.steps, defs);
      let subject = ""; // most-recent bound When
      let firstSubject = "";
      const results = resolved.map((rs) => {
        const r = bindResolved(rs, subject, vocab, idx);
        counts[r.state]++;
        if (r.state === "BOUND" && rs.kind === "when") {
          subject = r.handle;
          if (!firstSubject) firstSubject = r.handle;
          coveredWhen.add(r.handle);
        }
        return r;
      });
      scenarios.push({ scenario: sc.name, rule: sc.rule, subject: firstSubject, results });
    }
  }

  // direction (ii): contract → authored coverage holes.
  const holesAll = vocab.operations.filter((op) => !coveredWhen.has(op.handle));
  const holes: CoverageHole[] = holesAll.slice(0, opts.maxHoles ?? holesAll.length).map((op) => {
    const when = idx.whenByHandle.get(op.handle);
    const given = op.access === "authenticated" ? "    Given I am a signed-in user\n" : "";
    return { handle: op.handle, name: op.name, stub: `  Scenario: cover ${op.name}\n${given}    ${when?.phrase ?? "When I " + camel(op.name)}\n    Then it succeeds` };
  });

  return { scenarios, counts, coverage: { total: vocab.operations.length, covered: vocab.operations.length - holesAll.length, holes } };
}

// ---- the SCAFFOLDER's tooling: detect what is not yet runnable ----
export interface UndefinedStep {
  scenario: string;
  /** the original authored prose (the non-technical author's words). */
  text: string;
  line: number;
  /**
   * How to make it run. NONE of these requires a developer EXCEPT where the scaffolder, on review, finds no operation
   * provides the capability — then they escalate. The tool only ever SUGGESTS; it never asserts "a developer is required",
   * because absence of a lexical match is not evidence the capability is missing.
   *  - `alias` — a confident 1:1 target was found (a paraphrase of a generated step).
   *  - `map` — a related operation was found; map it (alias or decompose) to that op's steps.
   *  - `review` — no automatic match; the scaffolder maps it from the phrasebook, or escalates only if nothing backs it.
   *  - `define-journey` — a reference to a journey that is not defined yet.
   */
  resolution: "alias" | "map" | "review" | "define-journey";
  /** a paste-ready definitions stub (or, for `review`, the honest "decide" note). */
  suggestion: string;
}

/**
 * Detect every authored step that is not yet runnable — the scaffolder's worklist (Cucumber-style "undefined steps",
 * here resolved by MAPPING, not by writing code). It SUGGESTS a target when there is a lexical signal and otherwise
 * defers to the scaffolder; it never falsely claims a developer is required (absence of a word-match ≠ missing
 * capability). Reports against the ORIGINAL prose, deduped.
 */
export function detectUndefined(vocab: Vocabulary, features: Feature[], opts: BindOptions = {}): UndefinedStep[] {
  const report = bindFeatures(vocab, features, opts);
  const out: UndefinedStep[] = [];
  const seen = new Set<string>();
  for (const sc of report.scenarios) {
    for (const r of sc.results) {
      if (r.state === "BOUND") continue;
      const prose = r.expandedFrom?.text ?? r.step.text;
      const line = r.expandedFrom?.line ?? r.step.line;
      const key = `${sc.scenario}::${norm(prose)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const skel = norm(`${r.step.kind} ${prose}`);
      const stub = (target: string) => `definitions.steps: { ${JSON.stringify(skel)}: ${JSON.stringify(target)} }  // or an array to decompose`;
      let resolution: UndefinedStep["resolution"];
      let suggestion: string;
      if (r.state === "UNDEFINED") {
        resolution = "define-journey";
        suggestion = r.suggest;
      } else if (r.state === "PARAPHRASE" && r.canonical) {
        resolution = "alias";
        suggestion = stub(r.canonical);
      } else if (r.state === "NEEDS-DEV-GLUE" && r.canonical) {
        resolution = "map";
        suggestion = `likely maps to "${r.canonical}" — ${stub(r.canonical)}`;
      } else {
        resolution = "review"; // NEEDS-CONTRACT / AMBIGUOUS: no automatic match
        suggestion = `no automatic match — map it to a step from the phrasebook (renderPhrasebook), or escalate to a developer only if no operation provides this capability`;
      }
      out.push({ scenario: sc.scenario, text: prose, line, resolution, suggestion });
    }
  }
  return out;
}

/** Render the scaffolder worklist: what a non-technical author wrote that is not yet runnable, and how to resolve it. */
export function renderScaffold(undefinedSteps: UndefinedStep[]): string {
  if (!undefinedSteps.length) return "All authored steps are runnable — nothing to define. ✓";
  const suggested = undefinedSteps.filter((u) => u.resolution !== "review");
  const review = undefinedSteps.filter((u) => u.resolution === "review");
  const out: string[] = ["# Undefined steps — make the stories run (the scaffolder maps prose → bound steps; no code)", ""];
  if (suggested.length) {
    out.push("## Suggested mappings (a likely target was found — no developer):");
    for (const u of suggested) out.push(`  • [${u.resolution}] "${u.text}"  (${u.scenario}:${u.line})\n      ${u.suggestion}`);
    out.push("");
  }
  if (review.length) {
    out.push("## Needs your decision (no automatic match — map from the phrasebook, or escalate to a developer if nothing backs it):");
    for (const u of review) out.push(`  • "${u.text}"  (${u.scenario}:${u.line})\n      ${u.suggestion}`);
  }
  return out.join("\n");
}

/** Render the gap report as readable text (for a CLI / a download endpoint). */
export function renderGapReport(report: GapReport): string {
  const TAG: Record<BindState, string> = { BOUND: "✓ BOUND", PARAPHRASE: "≈ PARAPHRASE", "NEEDS-DEV-GLUE": "⚙ NEEDS-DEV-GLUE", "NEEDS-CONTRACT": "✗ NEEDS-CONTRACT", AMBIGUOUS: "⚠ AMBIGUOUS", UNDEFINED: "? UNDEFINED" };
  const out: string[] = [];
  for (const sc of report.scenarios) {
    out.push(`\n  Scenario: ${sc.scenario}${sc.rule ? `   (Rule: ${sc.rule})` : ""}`);
    for (const r of sc.results) {
      const from = r.expandedFrom ? `  «${r.expandedFrom.text}»` : "";
      out.push(`    ${r.step.kind.toUpperCase().padEnd(5)} ${r.step.text}${from}`);
      out.push(`          → ${TAG[r.state]}${r.handle ? `  [${r.handle}]` : ""}`);
      if (r.suggest) out.push(`            ↳ ${r.suggest}`);
    }
  }
  out.push(`\n  GAP SUMMARY  ${Object.entries(report.counts).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("   ")}`);
  out.push(`  COVERAGE  ${report.coverage.covered}/${report.coverage.total} operations covered; ${report.coverage.holes.length} stub(s) below.`);
  for (const h of report.coverage.holes) out.push(h.stub);
  return out.join("\n");
}
