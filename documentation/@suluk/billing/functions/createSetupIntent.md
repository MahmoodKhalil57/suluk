[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createSetupIntent

# Function: createSetupIntent()

> **createSetupIntent**(`cfg`, `customerId`, `userId`): `Promise`\<`string`\>

Defined in: [packages/billing/src/billing.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/billing.ts#L23)

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
