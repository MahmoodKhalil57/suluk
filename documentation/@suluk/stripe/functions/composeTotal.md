[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / composeTotal

# ~~Function: composeTotal()~~

> **composeTotal**(`parts`): [`OrderTotalFull`](../interfaces/OrderTotalFull.md)

Defined in: [pricing.ts:124](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/pricing.ts#L124)

Fold every component into ONE authoritative total: subtotal − discount + shipping + tax, each a non-negative whole
cent and the discount never exceeding the subtotal. The single place the order total is composed once shipping (a
ShippingOption) and tax (a TaxResult) are resolved — so the cart drawer, checkout summary, order record, and the
Stripe charge can never disagree.

## Parameters

### parts

#### discountCents?

`number`

#### shippingCents?

`number`

#### subtotalCents

`number`

#### taxCents?

`number`

## Returns

[`OrderTotalFull`](../interfaces/OrderTotalFull.md)
