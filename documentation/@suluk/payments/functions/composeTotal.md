[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / composeTotal

# Function: composeTotal()

> **composeTotal**(`parts`): [`OrderTotalFull`](../interfaces/OrderTotalFull.md)

Defined in: [tooling/ts/packages/payments/src/pricing.ts:124](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/pricing.ts#L124)

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
