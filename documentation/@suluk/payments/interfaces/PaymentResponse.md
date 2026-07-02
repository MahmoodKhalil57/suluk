[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / PaymentResponse

# Interface: PaymentResponse

Defined in: [tooling/ts/packages/payments/src/types.ts:141](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L141)

## Properties

### amount?

> `optional` **amount?**: [`MinorAmount`](MinorAmount.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:147](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L147)

the amount actually captured/authorized, when the processor reports it.

***

### connectorTransactionId?

> `optional` **connectorTransactionId?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:143](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L143)

***

### error?

> `optional` **error?**: [`PaymentError`](PaymentError.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:145](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L145)

***

### redirectionData?

> `optional` **redirectionData?**: [`RedirectionData`](RedirectionData.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:144](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L144)

***

### status

> **status**: [`PaymentStatus`](../enumerations/PaymentStatus.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:142](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L142)
