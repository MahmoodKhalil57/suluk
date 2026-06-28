/**
 * @suluk/journeys — intuitive, runnable BDD over a v4 "Suluk" contract.
 *
 * A non-technical author (PM / BA / QA) writes Gherkin user-stories/journeys against a step VOCABULARY projected
 * deterministically from the contract; the BINDER resolves each step EXACT-or-UNBOUND (outcomes relative to the
 * scenario's When-subject) and emits a bidirectional TRI-STATE gap report; the EMITTER lowers bound scenarios to a
 * runnable bun:test suite driven through @suluk/sdk's generated client. A pure function of the document. CANDIDATE tooling.
 *
 * The vocabulary names only contract facts (operations, params, statuses, store keys, access roles) — never request
 * VALUES — so it stays on the safe side of the D1 wall; the @suluk/core matcher never imports this package.
 */
export {
  generateVocabulary,
  renderPhrasebook,
  vocabularyHash,
  opHandle,
  type Vocabulary,
  type JourneyStep,
  type VocabOperation,
  type StepKind,
} from "./vocabulary";

export { parseFeature, type Feature, type Scenario, type FeatureStep } from "./gherkin";

export {
  bindFeatures,
  detectUndefined,
  renderGapReport,
  renderScaffold,
  type GapReport,
  type ScenarioResult,
  type StepResult,
  type BindState,
  type BindOptions,
  type CoverageHole,
  type Definitions,
  type UndefinedStep,
} from "./bind";

export { emitRunnableSuite, type EmitOptions } from "./emit";
