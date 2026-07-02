[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / UndefinedStep

# Interface: UndefinedStep

Defined in: [journeys/src/bind.ts:259](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/bind.ts#L259)

## Properties

### line

> **line**: `number`

Defined in: [journeys/src/bind.ts:263](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/bind.ts#L263)

***

### resolution

> **resolution**: `"alias"` \| `"map"` \| `"review"` \| `"define-journey"`

Defined in: [journeys/src/bind.ts:273](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/bind.ts#L273)

How to make it run. NONE of these requires a developer EXCEPT where the scaffolder, on review, finds no operation
provides the capability — then they escalate. The tool only ever SUGGESTS; it never asserts "a developer is required",
because absence of a lexical match is not evidence the capability is missing.
 - `alias` — a confident 1:1 target was found (a paraphrase of a generated step).
 - `map` — a related operation was found; map it (alias or decompose) to that op's steps.
 - `review` — no automatic match; the scaffolder maps it from the phrasebook, or escalates only if nothing backs it.
 - `define-journey` — a reference to a journey that is not defined yet.

***

### scenario

> **scenario**: `string`

Defined in: [journeys/src/bind.ts:260](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/bind.ts#L260)

***

### suggestion

> **suggestion**: `string`

Defined in: [journeys/src/bind.ts:275](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/bind.ts#L275)

a paste-ready definitions stub (or, for `review`, the honest "decide" note).

***

### text

> **text**: `string`

Defined in: [journeys/src/bind.ts:262](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/bind.ts#L262)

the original authored prose (the non-technical author's words).
