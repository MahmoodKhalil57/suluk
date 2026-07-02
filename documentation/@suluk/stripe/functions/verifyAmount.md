[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / verifyAmount

# ~~Function: verifyAmount()~~

> **verifyAmount**(`lines`, `discount`, `claimedCents`, `opts?`): [`AmountVerdict`](../interfaces/AmountVerdict.md)

Defined in: [pricing.ts:137](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/pricing.ts#L137)

ANTI-TAMPERING: recompute the total from authoritative line prices + the discount and compare it to the amount
the client claims (e.g. a PaymentIntent amount the browser posted). Reject any mismatch beyond `toleranceCents`
(default 0 — money is exact). The server must call this before honoring any client-supplied amount.

## Parameters

### lines

[`CartLine`](../interfaces/CartLine.md)[]

### discount

[`Discount`](../interfaces/Discount.md) \| `null` \| `undefined`

### claimedCents

`number`

### opts?

#### toleranceCents?

`number`

## Returns

[`AmountVerdict`](../interfaces/AmountVerdict.md)
