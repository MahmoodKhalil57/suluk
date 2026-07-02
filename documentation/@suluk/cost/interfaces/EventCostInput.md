[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / EventCostInput

# Interface: EventCostInput

Defined in: [event.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cost/src/event.ts#L47)

## Properties

### at

> **at**: `number`

Defined in: [event.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cost/src/event.ts#L55)

wall-clock ms (passed in — reproducible).

***

### event

> **event**: `Record`\<`string`, `unknown`\>

Defined in: [event.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cost/src/event.ts#L53)

the fired event payload.

***

### model

> **model**: [`CostModel`](CostModel.md)

Defined in: [event.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cost/src/event.ts#L51)

its declared cost model (carrying trigger / attribution / idempotencyKey).

***

### operation

> **operation**: `string`

Defined in: [event.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cost/src/event.ts#L49)

the operation name whose cost fired (the webhook/op by-name handle).

***

### suppliedPrincipal?

> `optional` **suppliedPrincipal?**: `string`

Defined in: [event.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cost/src/event.ts#L59)

for `session`/`job-stamped` attribution: the principal the job/session carries.

***

### usage?

> `optional` **usage?**: [`UsageReport`](UsageReport.md)[]

Defined in: [event.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cost/src/event.ts#L57)

any metered third-party usage the handler measured.
