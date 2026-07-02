[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createSetupIntent

# Function: createSetupIntent()

> **createSetupIntent**(`cfg`, `customerId`, `userId`): `Promise`\<`string`\>

Defined in: [packages/billing/src/billing.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/billing/src/billing.ts#L23)

Create a $0 SetupIntent to vault a card without charging ("Add card"). Returns the client secret.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

### userId

`string`

## Returns

`Promise`\<`string`\>
