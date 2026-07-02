[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / JourneyStep

# Interface: JourneyStep

Defined in: [journeys/src/vocabulary.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/journeys/src/vocabulary.ts#L19)

`@suluk/journeys` — intuitive, runnable BDD over a v4 "Suluk" contract.

A non-technical author (PM / BA / QA) writes Gherkin user-stories/journeys against a step VOCABULARY projected
deterministically from the contract; the BINDER resolves each step EXACT-or-UNBOUND (outcomes relative to the
scenario's When-subject) and emits a bidirectional TRI-STATE gap report; the EMITTER lowers bound scenarios to a
runnable bun:test suite driven through @suluk/sdk's generated client. A pure function of the document. CANDIDATE tooling.

The vocabulary names only contract facts (operations, params, statuses, store keys, access roles) — never request
VALUES — so it stays on the safe side of the D1 wall; the @suluk/core matcher never imports this package.

## Properties

### handle

> **handle**: `string`

Defined in: [journeys/src/vocabulary.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/journeys/src/vocabulary.ts#L27)

stable identity: `op.name@path-uri`, or `@access:<role>` for a Given.

***

### kind

> **kind**: [`StepKind`](../type-aliases/StepKind.md)

Defined in: [journeys/src/vocabulary.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/journeys/src/vocabulary.ts#L21)

Given / When / Then.

***

### phrase

> **phrase**: `string`

Defined in: [journeys/src/vocabulary.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/journeys/src/vocabulary.ts#L23)

the human-readable phrase an author writes, e.g. "When I checkout".

***

### skeleton

> **skeleton**: `string`

Defined in: [journeys/src/vocabulary.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/journeys/src/vocabulary.ts#L25)

the normalized matching skeleton (slot values stripped).

***

### via

> **via**: `string`

Defined in: [journeys/src/vocabulary.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/journeys/src/vocabulary.ts#L29)

provenance of this phrase (which contract fact produced it).
