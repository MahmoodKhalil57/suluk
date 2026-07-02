[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / RefundRequest

# Interface: RefundRequest

Defined in: [tooling/ts/packages/payments/src/types.ts:164](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/types.ts#L164)

## Properties

### connectorTransactionId

> **connectorTransactionId**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:166](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/types.ts#L166)

***

### merchantRefundId

> **merchantRefundId**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:165](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/types.ts#L165)

***

### paymentAmount

> **paymentAmount**: `number`

Defined in: [tooling/ts/packages/payments/src/types.ts:169](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/types.ts#L169)

the ORIGINAL payment amount (minor units) — some processors require it to compute a partial refund.

***

### reason?

> `optional` **reason?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:170](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/types.ts#L170)

***

### refundAmount

> **refundAmount**: [`MinorAmount`](MinorAmount.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:167](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/types.ts#L167)

***

### testMode?

> `optional` **testMode?**: `boolean`

Defined in: [tooling/ts/packages/payments/src/types.ts:171](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/types.ts#L171)
