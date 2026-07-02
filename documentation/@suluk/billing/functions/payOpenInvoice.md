[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / payOpenInvoice

# Function: payOpenInvoice()

> **payOpenInvoice**(`cfg`, `subscriptionId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/billing.ts:156](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/billing/src/billing.ts#L156)

Best-effort: if the subscription's latest invoice is still OPEN (a failed renewal), retry it NOW. No-op when there's
 nothing open to pay; never throws (a fix-billing flow must not 500 on the retry).

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### subscriptionId

`string`

## Returns

`Promise`\<`void`\>
