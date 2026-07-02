[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / planPromotions

# Function: planPromotions()

> **planPromotions**(`featureTexts`, `targets`, `sources`, `opts?`): [`PromotionPlan`](../interfaces/PromotionPlan.md)

Defined in: [journeys/src/cli.ts:101](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/journeys/src/cli.ts#L101)

Plan the promotions for every `@public` Examples row: build the public example (content-typed) and apply
`promoteExampleIntoZod` to the target's (pre-read) source — accumulating multiple rows per file. Pure: returns the
before/after source per file (the bin diffs + writes). The never-clobber refusals surface as skipped rows.

## Parameters

### featureTexts

`string`[]

### targets

`Map`\<`string`, [`PromoteTargetSpec`](../interfaces/PromoteTargetSpec.md)\>

### sources

`Record`\<`string`, `string`\>

### opts?

#### because?

`string`

## Returns

[`PromotionPlan`](../interfaces/PromotionPlan.md)
