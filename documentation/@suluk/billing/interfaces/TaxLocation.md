[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / TaxLocation

# Interface: TaxLocation

Defined in: [packages/billing/src/tax.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/billing/src/tax.ts#L18)

A buyer's tax location. The saved card's BILLING ADDRESS is preferred (precise + works off-session); the request IP is
 the fallback for a first on-session purchase where no card is saved yet.

## Properties

### address?

> `optional` **address?**: [`TaxAddress`](TaxAddress.md) \| `null`

Defined in: [packages/billing/src/tax.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/billing/src/tax.ts#L19)

***

### ip?

> `optional` **ip?**: `string` \| `null`

Defined in: [packages/billing/src/tax.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/billing/src/tax.ts#L20)
