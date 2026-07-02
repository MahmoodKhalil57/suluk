[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / AuthorizeRequest

# Interface: AuthorizeRequest

Defined in: [tooling/ts/packages/payments/src/types.ts:119](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L119)

## Properties

### address?

> `optional` **address?**: [`Address`](Address.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:125](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L125)

***

### amount

> **amount**: [`MinorAmount`](MinorAmount.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:121](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L121)

***

### authType

> **authType**: [`AuthenticationType`](../enumerations/AuthenticationType.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:124](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L124)

***

### captureMethod

> **captureMethod**: [`CaptureMethod`](../enumerations/CaptureMethod.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L122)

***

### customerId?

> `optional` **customerId?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:129](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L129)

an existing processor customer to attach the charge to (optional).

***

### merchantTransactionId

> **merchantTransactionId**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L120)

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `string`\>

Defined in: [tooling/ts/packages/payments/src/types.ts:137](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L137)

free-form key/value the processor stores + echoes on its webhook (e.g. `{ userId, credits }` the crediting path
 reads). Most processors support it (Stripe metadata, Adyen additionalData).

***

### offSession?

> `optional` **offSession?**: `boolean`

Defined in: [tooling/ts/packages/payments/src/types.ts:134](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L134)

the charge is happening WITHOUT the cardholder present (auto top-up / recurring) — the processor may decline for
 3DS (`AUTHENTICATION_PENDING`) rather than charge. Maps to Stripe `off_session`, Adyen `ContAuth`, etc.

***

### orderDetails?

> `optional` **orderDetails?**: [`OrderDetail`](OrderDetail.md)[]

Defined in: [tooling/ts/packages/payments/src/types.ts:127](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L127)

***

### paymentMethod

> **paymentMethod**: [`PaymentMethod`](PaymentMethod.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:123](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L123)

***

### returnUrl?

> `optional` **returnUrl?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:126](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L126)

***

### setupFutureUsage?

> `optional` **setupFutureUsage?**: `boolean`

Defined in: [tooling/ts/packages/payments/src/types.ts:131](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L131)

save the instrument for later off-session use (recurring / one-click).

***

### testMode?

> `optional` **testMode?**: `boolean`

Defined in: [tooling/ts/packages/payments/src/types.ts:138](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L138)
