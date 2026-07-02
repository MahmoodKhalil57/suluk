[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / StepKind

# Type Alias: StepKind

> **StepKind** = `"given"` \| `"when"` \| `"then"`

Defined in: [journeys/src/vocabulary.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/vocabulary.ts#L17)

`@suluk/journeys` — intuitive, runnable BDD over a v4 "Suluk" contract.

A non-technical author (PM / BA / QA) writes Gherkin user-stories/journeys against a step VOCABULARY projected
deterministically from the contract; the BINDER resolves each step EXACT-or-UNBOUND (outcomes relative to the
scenario's When-subject) and emits a bidirectional TRI-STATE gap report; the EMITTER lowers bound scenarios to a
runnable bun:test suite driven through @suluk/sdk's generated client. A pure function of the document. CANDIDATE tooling.

The vocabulary names only contract facts (operations, params, statuses, store keys, access roles) — never request
VALUES — so it stays on the safe side of the D1 wall; the @suluk/core matcher never imports this package.
