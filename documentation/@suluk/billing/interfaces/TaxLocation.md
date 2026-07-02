[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / TaxLocation

# Interface: TaxLocation

Defined in: [packages/billing/src/tax.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/tax.ts#L18)

A buyer's tax location. The saved card's BILLING ADDRESS is preferred (precise + works off-session); the request IP is
 the fallback for a first on-session purchase where no card is saved yet.

## Properties

### address?

> `optional` **address?**: [`TaxAddress`](TaxAddress.md) \| `null`

Defined in: [packages/billing/src/tax.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/tax.ts#L19)

***

### ip?

> `optional` **ip?**: `string` \| `null`

Defined in: [packages/billing/src/tax.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/tax.ts#L20)
