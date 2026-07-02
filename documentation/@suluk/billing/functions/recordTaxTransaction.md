[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / recordTaxTransaction

# Function: recordTaxTransaction()

> **recordTaxTransaction**(`cfg`, `calculationId`, `reference`): `Promise`\<`void`\>

Defined in: [packages/billing/src/tax.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/billing/src/tax.ts#L73)

Record a finished tax calculation as a Tax Transaction (the compliance/reporting step), keyed to a `reference`
 (e.g. `pi:<id>`) which is Stripe's idempotency anchor — a replay of the same reference returns the existing
 transaction rather than creating a second, so re-delivery can't double-record. Best-effort — never throws into the
 caller (the charge already succeeded; a missed record is reconciled manually).

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### calculationId

`string`

### reference

`string`

## Returns

`Promise`\<`void`\>
