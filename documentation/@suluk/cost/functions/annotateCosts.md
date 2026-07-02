[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / annotateCosts

# Function: annotateCosts()

> **annotateCosts**(`doc`, `costs`): [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

Defined in: [contract.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cost/src/contract.ts#L41)

Annotate a v4 document in place-safe (returns a new doc): set x-suluk-cost on each named operation (incl. webhooks).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### costs

`Record`\<`string`, [`CostModel`](../interfaces/CostModel.md)\>

## Returns

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)
