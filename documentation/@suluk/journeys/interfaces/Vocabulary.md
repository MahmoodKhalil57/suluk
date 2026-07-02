[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / Vocabulary

# Interface: Vocabulary

Defined in: [journeys/src/vocabulary.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/journeys/src/vocabulary.ts#L40)

`@suluk/journeys` — intuitive, runnable BDD over a v4 "Suluk" contract.

A non-technical author (PM / BA / QA) writes Gherkin user-stories/journeys against a step VOCABULARY projected
deterministically from the contract; the BINDER resolves each step EXACT-or-UNBOUND (outcomes relative to the
scenario's When-subject) and emits a bidirectional TRI-STATE gap report; the EMITTER lowers bound scenarios to a
runnable bun:test suite driven through @suluk/sdk's generated client. A pure function of the document. CANDIDATE tooling.

The vocabulary names only contract facts (operations, params, statuses, store keys, access roles) — never request
VALUES — so it stays on the safe side of the D1 wall; the @suluk/core matcher never imports this package.

## Properties

### operations

> **operations**: [`VocabOperation`](VocabOperation.md)[]

Defined in: [journeys/src/vocabulary.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/journeys/src/vocabulary.ts#L44)

the operation table (for coverage + the phrasebook).

***

### steps

> **steps**: [`JourneyStep`](JourneyStep.md)[]

Defined in: [journeys/src/vocabulary.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/journeys/src/vocabulary.ts#L42)

every generated step, sorted deterministically.
