[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / calculateTax

# Function: calculateTax()

> **calculateTax**(`cfg`, `customerId`, `subtotalCents`, `loc`): `Promise`\<[`TaxResult`](../interfaces/TaxResult.md)\>

Defined in: [packages/billing/src/tax.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/tax.ts#L47)

Sales-tax / VAT for an on-site or auto top-up. The taxable base is the credits `subtotalCents` (tax_behavior=exclusive →
tax added on top); the processing service fee is a pass-through, not part of the taxable sale. Located by the saved
card's billing address (preferred — works off-session) or the request IP. GRACEFUL — no location or any failure yields
`{ taxCents: 0 }` so a top-up always proceeds. When active, the returned `calculationId` is recorded via
[recordTaxTransaction](recordTaxTransaction.md).

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

### subtotalCents

`number`

### loc

[`TaxLocation`](../interfaces/TaxLocation.md)

## Returns

`Promise`\<[`TaxResult`](../interfaces/TaxResult.md)\>
