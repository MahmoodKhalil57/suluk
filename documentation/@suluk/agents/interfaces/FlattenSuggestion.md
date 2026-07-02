[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / FlattenSuggestion

# Interface: FlattenSuggestion

Defined in: [agents/src/context.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/context.ts#L84)

The dual of unflatten: a thin/redundant layer worth collapsing UP into its parent.

## Properties

### child

> **child**: `string`

Defined in: [agents/src/context.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/context.ts#L86)

***

### fitsTarget

> **fitsTarget**: `boolean`

Defined in: [agents/src/context.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/context.ts#L90)

***

### mergedParentTokens

> **mergedParentTokens**: `number`

Defined in: [agents/src/context.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/context.ts#L89)

the parent's load if the child's resident tools+instructions were inlined.

***

### parent

> **parent**: `string`

Defined in: [agents/src/context.ts:85](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/context.ts#L85)

***

### reason

> **reason**: `string`

Defined in: [agents/src/context.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/context.ts#L87)

***

### savedHopOverhead

> **savedHopOverhead**: `number`

Defined in: [agents/src/context.ts:92](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/context.ts#L92)

per-hop overhead removed by collapsing (the child's framing + its dispatch tool).
