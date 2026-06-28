# @suluk/journeys

**Intuitive, runnable BDD over a v4 "Suluk" contract** — a non-technical author (PM / BA / QA) writes Gherkin
user-stories and journeys against a step vocabulary *generated from the contract*, and a bidirectional gap report
tells everyone exactly what the contract can and cannot yet back.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for OpenAPI v4.0 ("Moonwalk"),
> unaffiliated with the OpenAPI Initiative. See [ADR C038](../../../../doc/architecture/decisions/C038-suluk-journeys-bdd.md).

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
   in the contract — the [D1 wall](../../../../doc/architecture/decisions/C038-suluk-journeys-bdd.md)).
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

## Discovery (designed, gated)

A semantic *reuse* search — "find an existing flow to reuse / modify / rebuild" — is designed (a deterministic
faceted handle-index inside this package; the reuse verdict is set algebra over contract-handle overlap; an embedding
overlay is a walled-off, gated sibling). It is **deferred until a real corpus exists**. See ADR C038.

## Status

`0.1.0`, ceiling **0.45** — originated, projection-model-native, spike-witnessed on the real toolfactory contract; the
open question is whether the constrained-vocabulary-plus-alias UX feels intuitive to a real non-technical author.
