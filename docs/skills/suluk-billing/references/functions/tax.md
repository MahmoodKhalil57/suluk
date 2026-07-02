# Functions

## tax

### `calculateTax`
Sales-tax / VAT for an on-site or auto top-up. The taxable base is the credits `subtotalCents` (tax_behavior=exclusive →
tax added on top); the processing service fee is a pass-through, not part of the taxable sale. Located by the saved
card's billing address (preferred — works off-session) or the request IP. GRACEFUL — no location or any failure yields
`{ taxCents: 0 }` so a top-up always proceeds. When active, the returned `calculationId` is recorded via
recordTaxTransaction.
```ts
calculateTax(cfg: StripeConfig, customerId: string, subtotalCents: number, loc: TaxLocation): Promise<TaxResult>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
- `subtotalCents: number`
- `loc: TaxLocation`
**Returns:** `Promise<TaxResult>`

### `recordTaxTransaction`
Record a finished tax calculation as a Tax Transaction (the compliance/reporting step), keyed to a `reference`
 (e.g. `pi:<id>`) which is Stripe's idempotency anchor — a replay of the same reference returns the existing
 transaction rather than creating a second, so re-delivery can't double-record. Best-effort — never throws into the
 caller (the charge already succeeded; a missed record is reconciled manually).
```ts
recordTaxTransaction(cfg: StripeConfig, calculationId: string, reference: string): Promise<void>
```
**Parameters:**
- `cfg: StripeConfig`
- `calculationId: string`
- `reference: string`
**Returns:** `Promise<void>`
