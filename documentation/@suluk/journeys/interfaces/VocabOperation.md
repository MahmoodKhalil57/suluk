[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / VocabOperation

# Interface: VocabOperation

Defined in: [journeys/src/vocabulary.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/vocabulary.ts#L32)

`@suluk/journeys` — intuitive, runnable BDD over a v4 "Suluk" contract.

A non-technical author (PM / BA / QA) writes Gherkin user-stories/journeys against a step VOCABULARY projected
deterministically from the contract; the BINDER resolves each step EXACT-or-UNBOUND (outcomes relative to the
scenario's When-subject) and emits a bidirectional TRI-STATE gap report; the EMITTER lowers bound scenarios to a
runnable bun:test suite driven through @suluk/sdk's generated client. A pure function of the document. CANDIDATE tooling.

The vocabulary names only contract facts (operations, params, statuses, store keys, access roles) — never request
VALUES — so it stays on the safe side of the D1 wall; the @suluk/core matcher never imports this package.

## Properties

### access

> **access**: `string`

Defined in: [journeys/src/vocabulary.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/vocabulary.ts#L37)

***

### handle

> **handle**: `string`

Defined in: [journeys/src/vocabulary.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/vocabulary.ts#L33)

***

### method

> **method**: `string`

Defined in: [journeys/src/vocabulary.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/vocabulary.ts#L36)

***

### name

> **name**: `string`

Defined in: [journeys/src/vocabulary.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/vocabulary.ts#L34)

***

### path

> **path**: `string`

Defined in: [journeys/src/vocabulary.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/vocabulary.ts#L35)
