[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/journeys

# @suluk/journeys

**Intuitive, runnable BDD over a v4 "Suluk" contract** — a non-technical author (PM / BA / QA) writes Gherkin
user-stories and journeys against a step vocabulary *generated from the contract*, and a bidirectional gap report
tells everyone exactly what the contract can and cannot yet back.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for OpenAPI v4.0 ("Moonwalk"),
> unaffiliated with the OpenAPI Initiative. See [ADR C038](../../_media/C038-suluk-journeys-bdd.md).

## The loop

```
contract ──generateVocabulary──▶ step palette ──▶ humans author .feature stories
   ▲                                                        │
   └── dev fills the gap ◀── bidirectional gap report ◀── bindFeatures
```

1. **`generateVocabulary(doc)`** projects the contract into a deterministic Gherkin step palette:
   - **Given** ← `x-suluk-access` (`authenticated` → *"Given I am a signed-in user"*)
   - **When** ← each operation (`checkout` → *"When I checkout"*, `getCredits` → *"When I view credits"*)
   - **Then** ← declared statuses (*"Then it succeeds"*), `x-suluk-store` (*"Then my credits refreshes"*), per-unit
     `x-suluk-cost` (*"Then I am charged credits"*)
2. A non-technical author writes plain `.feature` files against that palette (the prose lives in a **sidecar**, never
   in the contract — the [D1 wall](../../_media/C038-suluk-journeys-bdd.md)).
3. **`bindFeatures(vocab, features)`** binds each step **exact-or-UNBOUND**, with outcome (`Then`) steps resolved
   relative to the scenario's `When`-subject, and reports the gaps **both ways**.

## What a "gap" is — bidirectional, tri-state

- **authored → contract.** An unbound step is classified deterministically:
  - **PARAPHRASE** — you wrote it differently; an author-owned alias resolves it, *no developer needed*.
  - **NEEDS-DEV-GLUE** — the operation exists, but no step wires it; a developer adds one.
  - **NEEDS-CONTRACT** — nothing backs the intent; a developer extends the contract.
- **contract → authored.** A pure set-difference over the stable handle space surfaces every operation/store with **no
  covering scenario** — the *"complete"* guarantee — and emits a drop-in stub for each.

Binding never uses scoring, lemmatization, or embeddings — those would make the decision non-deterministic. String
similarity appears only in the *presentational* "did you mean?" suggestion on an already-unbound step.

## Runnable — and it partly tests your frontend

`emitRunnableSuite(vocab, features)` lowers bound scenarios to a self-contained `bun:test` suite driven through
**`@suluk/sdk`'s generated client** — the same client your frontend ships on. A green scenario exercises the real
frontend **data-path**: typed dispatch, input validation, the auth interceptor, response decode, and the C037 store
invalidation/refetch. **Honest boundary:** it tests client + contract + wire + the store data layer — **not** rendered
UI, layout, or visual behavior (there is no DOM in a `bun:test`). That last mile is `@suluk/visual` + a browser.

## Usage

```ts
import { generateVocabulary, parseFeature, bindFeatures, renderGapReport, renderPhrasebook } from "@suluk/journeys";
import { apiDocument } from "./contract"; // your v4 contract

const vocab = generateVocabulary(apiDocument());
console.log(renderPhrasebook(vocab)); // the palette an author picks from

const feature = parseFeature(await Bun.file("./billing.feature").text());
const report = bindFeatures(vocab, [feature], {
  aliases: { "given i am a logged in user": "given i am a signed-in user" }, // author-owned, no dev
});
console.log(renderGapReport(report));
```

## Stable identity

Step identity is `op.name@path-uri` (the by-name handle), **not** the `@suluk/sdk` client accessor — `resolveOps`
mutates the accessor in place during collision resolution, so accessor-keyed identity would churn when a sibling
operation is added. (Witnessed on toolfactory's `api/billing/subscription`, which holds both `getSubscription` and
`cancelSubscription`.)

## Two-role authoring + composition (no developer)

A non-technical author can write stories in their **own words** and hand them to a **scaffolder** (a more technical
author — *not* a developer) who maps that free prose onto the runnable vocabulary. Neither role writes code.

- **`detectUndefined(vocab, features, defs)`** is the scaffolder's worklist (Cucumber-style undefined-step detection,
  resolved by *mapping* not coding). It splits each not-yet-runnable step into **"the scaffolder can define this"**
  (an operation/step exists → alias or decompose) vs **"escalate to a developer"** (`NEEDS-CONTRACT` — no operation
  backs it). `renderScaffold(...)` prints it with paste-ready stubs.
- A **`Definitions`** artifact (author/scaffolder-owned data) turns prose into runnable steps three ways:
  - **alias** — `"prose": "When I checkout"` (one canonical step)
  - **decomposition** — `"I sign up and buy credits": ["Given I am a signed-in user", "When I checkout", "Then it succeeds"]`
  - **journey** — a named, reusable sequence referenced from a story with `When I complete the "top up" journey`

```ts
const defs = {
  steps: { "when i sign up and buy credits": ["Given I am a signed-in user", "When I checkout", "Then it succeeds"] },
  journeys: { "top up": ["Given I am a signed-in user", "When I checkout", "Then it succeeds"] },
};
const report = bindFeatures(vocab, [story], { definitions: defs });   // composed + decomposed, all bound
const todo = detectUndefined(vocab, [story], { definitions: defs });  // what still needs defining / escalation
```

**Composition** lets authors build bigger journeys out of existing ones (`complete the "…" journey`), and outcome
steps bind to the **most-recent** action, so multi-step journeys bind each `Then` to its own `When`. The only thing
that ever needs a developer is genuinely new backend capability (`NEEDS-CONTRACT`) — composition and mapping do not.

## Discovery (designed, gated)

A semantic *reuse* search — "find an existing flow to reuse / modify / rebuild" — is designed (a deterministic
faceted handle-index inside this package; the reuse verdict is set algebra over contract-handle overlap; an embedding
overlay is a walled-off, gated sibling). It is **deferred until a real corpus exists**. See ADR C038.

## Status

`0.1.0`, ceiling **0.45** — originated, projection-model-native, spike-witnessed on the real toolfactory contract; the
open question is whether the constrained-vocabulary-plus-alias UX feels intuitive to a real non-technical author.

## Interfaces

- [AuditResult](interfaces/AuditResult.md)
- [BindOptions](interfaces/BindOptions.md)
- [BuildDemoFilesOptions](interfaces/BuildDemoFilesOptions.md)
- [CompileDemoOptions](interfaces/CompileDemoOptions.md)
- [CoverageGrade](interfaces/CoverageGrade.md)
- [CoverageHole](interfaces/CoverageHole.md)
- [Definitions](interfaces/Definitions.md)
- [DemoCapture](interfaces/DemoCapture.md)
- [DemoFilesResult](interfaces/DemoFilesResult.md)
- [DemoRequest](interfaces/DemoRequest.md)
- [DemoScenario](interfaces/DemoScenario.md)
- [DimensionAudit](interfaces/DimensionAudit.md)
- [EmitOptions](interfaces/EmitOptions.md)
- [ExampleSources](interfaces/ExampleSources.md)
- [Feature](interfaces/Feature.md)
- [FeatureStep](interfaces/FeatureStep.md)
- [FieldDescriptor](interfaces/FieldDescriptor.md)
- [GapReport](interfaces/GapReport.md)
- [JourneyStep](interfaces/JourneyStep.md)
- [OutlineColumn](interfaces/OutlineColumn.md)
- [OutlineRenderOptions](interfaces/OutlineRenderOptions.md)
- [PromoteFeatureResult](interfaces/PromoteFeatureResult.md)
- [PromoteResult](interfaces/PromoteResult.md)
- [PromoteTarget](interfaces/PromoteTarget.md)
- [PromoteTargetSpec](interfaces/PromoteTargetSpec.md)
- [PromotionFileResult](interfaces/PromotionFileResult.md)
- [PromotionPlan](interfaces/PromotionPlan.md)
- [PromotionRow](interfaces/PromotionRow.md)
- [PublicExampleRow](interfaces/PublicExampleRow.md)
- [RenderOptions](interfaces/RenderOptions.md)
- [ResolvedExample](interfaces/ResolvedExample.md)
- [Scenario](interfaces/Scenario.md)
- [ScenarioOutline](interfaces/ScenarioOutline.md)
- [ScenarioResult](interfaces/ScenarioResult.md)
- [SourceRef](interfaces/SourceRef.md)
- [StepResult](interfaces/StepResult.md)
- [SynthOptions](interfaces/SynthOptions.md)
- [UndefinedStep](interfaces/UndefinedStep.md)
- [VocabOperation](interfaces/VocabOperation.md)
- [Vocabulary](interfaces/Vocabulary.md)

## Type Aliases

- [BindState](type-aliases/BindState.md)
- [DemoFormat](type-aliases/DemoFormat.md)
- [DemoValue](type-aliases/DemoValue.md)
- [ExampleTier](type-aliases/ExampleTier.md)
- [FieldOrigin](type-aliases/FieldOrigin.md)
- [FieldSource](type-aliases/FieldSource.md)
- [JsonSchema](type-aliases/JsonSchema.md)
- [StepKind](type-aliases/StepKind.md)
- [SynthDirection](type-aliases/SynthDirection.md)

## Variables

- [FROM\_KEYWORD](variables/FROM_KEYWORD.md)
- [ORIGIN\_KEYWORD](variables/ORIGIN_KEYWORD.md)

## Functions

- [asSourceRef](functions/asSourceRef.md)
- [bindFeatures](functions/bindFeatures.md)
- [buildAudit](functions/buildAudit.md)
- [buildDemoFiles](functions/buildDemoFiles.md)
- [buildExampleObject](functions/buildExampleObject.md)
- [buildScenarioOutlines](functions/buildScenarioOutlines.md)
- [compileDemos](functions/compileDemos.md)
- [coverageGrade](functions/coverageGrade.md)
- [describeInputs](functions/describeInputs.md)
- [detectUndefined](functions/detectUndefined.md)
- [emitRunnableSuite](functions/emitRunnableSuite.md)
- [extractPublicRows](functions/extractPublicRows.md)
- [fieldOrigin](functions/fieldOrigin.md)
- [generateVocabulary](functions/generateVocabulary.md)
- [miniDiff](functions/miniDiff.md)
- [opHandle](functions/opHandle.md)
- [parseFeature](functions/parseFeature.md)
- [parseTargetSpec](functions/parseTargetSpec.md)
- [planPromotions](functions/planPromotions.md)
- [promoteExampleIntoZod](functions/promoteExampleIntoZod.md)
- [promoteFeatureExamples](functions/promoteFeatureExamples.md)
- [renderBruno](functions/renderBruno.md)
- [renderGapReport](functions/renderGapReport.md)
- [renderPhrasebook](functions/renderPhrasebook.md)
- [renderPostman](functions/renderPostman.md)
- [renderScaffold](functions/renderScaffold.md)
- [renderScenarioOutlines](functions/renderScenarioOutlines.md)
- [resolveExample](functions/resolveExample.md)
- [resolveSourced](functions/resolveSourced.md)
- [synthesize](functions/synthesize.md)
- [vocabularyHash](functions/vocabularyHash.md)
