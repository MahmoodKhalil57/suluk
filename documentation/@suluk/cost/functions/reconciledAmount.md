[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / reconciledAmount

# Function: reconciledAmount()

> **reconciledAmount**(`model`, `event`): `number` \| `undefined`

Defined in: [event.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/event.ts#L67)

Resolve the ACTUAL charged amount (in µ$) from the event when the model is `payload-reconciled` (C026), else
undefined. Reads the runtime amount-expression (e.g. the Stripe event amount) and converts from its declared unit
— so the recorded cost is the third party's real invoice line, not the operator's declared estimate.

## Parameters

### model

[`CostModel`](../interfaces/CostModel.md)

### event

`Record`\<`string`, `unknown`\>

## Returns

`number` \| `undefined`
