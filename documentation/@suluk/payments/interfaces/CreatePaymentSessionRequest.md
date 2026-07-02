[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / CreatePaymentSessionRequest

# Interface: CreatePaymentSessionRequest

Defined in: [tooling/ts/packages/payments/src/types.ts:201](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L201)

Create a PAYMENT session to confirm in-browser. Omit `paymentMethod` for a Payment-Element flow (the browser collects
 the card); pass a saved `paymentMethod` token for a one-click charge on a saved card.

## Properties

### amount

> **amount**: [`MinorAmount`](MinorAmount.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:202](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L202)

***

### captureMethod?

> `optional` **captureMethod?**: [`CaptureMethod`](../enumerations/CaptureMethod.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:206](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L206)

***

### customerId?

> `optional` **customerId?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:203](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L203)

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `string`\>

Defined in: [tooling/ts/packages/payments/src/types.ts:209](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L209)

***

### paymentMethod?

> `optional` **paymentMethod?**: [`Secret`](../type-aliases/Secret.md)\<`string`\>

Defined in: [tooling/ts/packages/payments/src/types.ts:205](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L205)

pin the charge to a saved instrument (one-click); omit to let the browser collect one (Payment Element).

***

### setupFutureUsage?

> `optional` **setupFutureUsage?**: `boolean`

Defined in: [tooling/ts/packages/payments/src/types.ts:208](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L208)

save the collected card for later off-session use.
