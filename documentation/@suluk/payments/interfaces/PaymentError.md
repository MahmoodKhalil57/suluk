[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / PaymentError

# Interface: PaymentError

Defined in: [tooling/ts/packages/payments/src/types.ts:104](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/types.ts#L104)

A structured error the library surfaces (in-band on FAILURE, or on a thrown IntegrationError/ConnectorError). Only
 primitive fields — never a processor's raw object (which may not be serializable).

## Properties

### code?

> `optional` **code?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:106](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/types.ts#L106)

***

### message?

> `optional` **message?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:105](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/types.ts#L105)

***

### reason?

> `optional` **reason?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/types.ts#L107)
