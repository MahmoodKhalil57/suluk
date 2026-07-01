# C38. `@suluk/journeys` — intuitive runnable BDD over a v4 contract (vocabulary projection + bidirectional gap detection)

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Introduces a new package, **`@suluk/journeys`**, that
> lets a NON-technical author (project manager / business analyst / QA) — and a developer — write **intuitive, runnable
> Gherkin** user-stories and journeys against a step **vocabulary projected from the v4 contract**, and reports the
> **gaps** (what the contract cannot yet back) so a developer can fill them, enriching the vocabulary for the next
> author. Decided by **three council sessions** (`wf_2b935f6e-ed3` journeys-v1 · `wf_45bff8f5-5a3` sdk-runnable ·
> `wf_ae8159e8-af1` discovery) and a **spike on the real toolfactory contract** (`api/src/contract.ts`, 31 operations).
> Operator-surfaced over three turns: write intuitive BDD; bind through `@suluk/sdk` so the suite partly tests the
> frontend; semantically search the corpus to reuse existing flows; and prove it on toolfactory.

Date: 2026-06-28

## Status

Accepted (candidate-fork). Decision ceiling **0.45** — Originated, projection-model-native, **spike-witnessed
mechanism but author-UX unwitnessed**. The discovery extension is **0.4 and GATED** (built-by-nobody until a corpus
exists). Ledger: [`0journeys.bn`](../../../plan/facts/0journeys.bn) (burhan True, converge clean **282**). No SIG prior
(BDD is out of OpenAPI's scope) — this is a tooling-layer decision riding the same projection model as `@suluk/sdk` /
`@suluk/testgen`.

## Context

A v4 contract already projects a typed client (`@suluk/sdk`), a conformance suite (`@suluk/testgen`), rendered docs
(`@suluk/scalar`), and a reactive frontend (C037). What it does **not** give a non-technical stakeholder is a way to
express **intent** — "a signed-in user tops up credits, and their balance refreshes" — in language they can write and
read, and to know **which of those intents the contract can actually back**. Today that work is either skipped or done
as developer `bun:test` files (real example: toolfactory's ~40 `*.test.ts`) that a PM/BA/QA cannot author or audit.

The loop the operator asked for: **contract → generated step vocabulary → humans author stories/journeys → gap report
→ a developer fills the gaps (alias / step-glue / new operation) → richer vocabulary → repeat.** The backward edge
(authored-intent the contract cannot yet back) is the novel part, and the part most able to violate Suluk's spine —
so the whole design is organized around keeping the deterministic projection core clean of human prose.

## Decision

Ship **`@suluk/journeys`** (`tooling/ts/packages/journeys/`) as a pure projection package. v1:

1. **Sidecar, no contract facet.** The step vocabulary is a pure derivation of names the contract already holds
   (operation handles, param **names**, response statuses, `x-suluk-store` keys, `x-suluk-access` roles); it carries
   zero information the contract lacks, so no `x-suluk-journeys` facet is minted. Authored `.feature` stories are free
   human prose — request **values** the D1 wall forbids in the contract — so they live as a **sidecar** bound to the
   doc by a C036-style provenance pointer `{source, contentHash, version}`.
2. **`generateVocabulary(doc)`** → a deterministic, content-hashed step palette (the **Given** from `x-suluk-access`,
   the **When** from method + operation name, the **Then** from declared statuses + `x-suluk-store` + per-unit
   `x-suluk-cost`) + a foldable human phrasebook.
3. **Exact-or-UNBOUND binding, subject-relative outcomes.** A step equals a generated phrase skeleton (slot values
   stripped *by the template's slot positions*, never by re-tokenizing prose) → a single stable handle, or it is
   **UNBOUND** (first-class, blameless). **Outcome (`Then`) steps bind relative to the scenario's `When`-subject** —
   the correction the spike forced (see below). No scoring/lemmatization/embedding ever decides a bind; string-distance
   is presentational only.
4. **Stable identity = `op.name` + path-uri** (the C009 by-name handle), **not** the `@suluk/sdk` `clientAccessor`
   (`resolveOps` mutates `op.member` in place). `clientAccessor` is used only as the late call-site lowering.
5. **Bidirectional, tri-state gaps.** (i) authored-step → backing, classified deterministically into **PARAPHRASE**
   (an editable, author-owned alias resolves it — no dev), **NEEDS-DEV-GLUE** (operation exists, no step wires it), or
   **NEEDS-CONTRACT** (nothing backs it — a dev extends the contract). (ii) contract → authored: a pure set-difference
   over the handle space surfaces every uncovered operation/store (the **"complete"** guarantee) + a drop-in stub each.
6. **Runnable through `@suluk/sdk`'s generated client + nano-stores** — so a passing scenario exercises the real
   frontend **data-path** (typed dispatch, input validation, the auth interceptor, response decode, and the C037 store
   invalidation/refetch + notify seam). **Honest boundary, carried as a literal report label:** it tests
   client + contract + wire + the store data layer, **not** rendered UI / layout / visual (no DOM in a `bun:test`) —
   that last mile is `@suluk/visual` + a browser.

## D1 gate

v1 adds **no facet**, so `buildAda` / `matchRequest` have nothing new to ignore — `@suluk/journeys` is a downstream
**consumer** of the contract, never an input. The wall sits between the **derived step vocabulary** (deterministic;
operation / param / status / store / role **names** — all D1-safe contract facts) and the **free human prose** in a
step's arg slot (a runtime/test-input **value** the matcher must never read). A pre-commit
`core/test/journeys-d1-invariance.test.ts` (cloning `store-d1-invariance.test.ts`'s two-claim gate) pre-walls a
hypothetical future `x-suluk-journeys` facet so it can never land unwalled. Claim `journeys_d1_downstream_consumer`
sits at the originated ceiling (0.5), below the ≥0.85 mizan assert-gate.

## Witness — the toolfactory spike (what made this honest)

A throwaway spike imported toolfactory's live contract (`apiDocument()`, 31 ops) and ran the full projector + binder.
It **witnessed** the load-bearing claims and **caught a real defect**:

- **Stable identity:** toolfactory's `api/billing/subscription` holds **both** `getSubscription` and
  `cancelSubscription`; `name`+path keeps them distinct where a name-only or path-only key would mis-merge.
- **Exact-or-UNBOUND never silently mis-binds:** a paraphrase ("start a checkout for $20") landed UNBOUND (surfaced for
  confirmation), not bound to `checkout`. **Defect found + fixed:** a *global* phrase→handle map mis-bound the generic
  `Then it succeeds` to an arbitrary op (`health`) — exactly the council's predicted ambiguity failure — and binding
  outcomes **subject-relative** corrected it.
- **Gaps + coverage:** 7 intuitive scenarios → 16 BOUND / 3 NEEDS-DEV-GLUE / 3 NEEDS-CONTRACT; coverage 4/31 with 27
  drop-in stubs. It also surfaced two honest source-gaps: `x-suluk-access` is too coarse to express *admin* scope, and
  phrasing for non-`get`/`list` query ops needs `op.summary` enrichment (tech-writer's condition).

**Residual open (not closed by the spike):** whether the constrained-vocabulary-plus-alias UX feels *intuitive* vs
*rigid* to a real PM — an empirical question needing an author-in-the-loop witness.

## Discovery extension (semantic reuse-search) — DESIGNED, GATED (v2+, ceiling 0.4)

The discovery council (6/6 voices co-first) decided: a non-technical user finds existing flows to reuse/modify/rebuild
via a **deterministic faceted handle-index INSIDE `@suluk/journeys`** (`generateJourneyIndex(doc, corpus)`, a second
pure projection over the contract-handle sets each bound scenario already carries). The **reuse/modify/rebuild verdict
is pure set algebra** (exact-equality → REUSE; subset/superset/overlap → MODIFY; disjoint → REBUILD), **grounded in
contract-handle overlap, never prose vibes**. A semantic **embedding overlay** (CF Vectorize + Workers AI) is a
**walled-off, gated sibling** `@suluk/journeys-recall` that can only *add* human-facing recall candidates for a
cold author — its cosine never orders a result or feeds a verdict. The search surface is a read-only panel in
`@suluk/editor`. **Gated on a real corpus existing** (honest empty-corpus sequencing): v1 ships only the near-free
HandleSet emission + the contract-coverage map; the index/overlay/UI are deferred behind a measured corpus-size gate.

## Consequences

- A new published package `@suluk/journeys`; `@suluk/core` never imports it (D1 by module boundary, the C027 rule).
- toolfactory becomes the first real consumer — converting the BDD cowpath from a forward hypothesis into a witness.
- **Deferred / gated:** carried-data + teardown across a live-deploy journey (v2 journey-as-unit, dev wires the carry
  once); `op.summary`-sourced phrasing + rendered-phrase collision policy; the discovery index/overlay/editor panel;
  any `x-suluk-journeys` facet (only on a witnessed cowpath no existing facet can carry).
- **Honesty carried forward:** ceilings stay low (0.45 / 0.4) until an author-in-the-loop witness and a real corpus
  land; the frontend-coverage claim ships with its literal "data-path, not rendered-UI" label; nothing is laundered.
