[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / Definitions

# Interface: Definitions

Defined in: [journeys/src/bind.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/journeys/src/bind.ts#L31)

The SCAFFOLDER's mapping layer (author-owned data, no developer). Turns a non-technical author's free prose into
runnable Gherkin without touching code.

## Properties

### journeys?

> `optional` **journeys?**: `Record`\<`string`, `string`[]\>

Defined in: [journeys/src/bind.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/journeys/src/bind.ts#L37)

named JOURNEYS for composition: a journey name → an ordered list of step phrases (each itself bound or defined).
 Referenced from a story with `When I complete the "<name>" journey`.

***

### steps?

> `optional` **steps?**: `Record`\<`string`, `string` \| `string`[]\>

Defined in: [journeys/src/bind.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/journeys/src/bind.ts#L34)

a free-prose step (normalized) → a canonical generated phrase (ALIAS) OR an ordered list of canonical phrases
 (manual DECOMPOSITION). Each canonical phrase carries its keyword, e.g. "When I checkout" / "Then it succeeds".
