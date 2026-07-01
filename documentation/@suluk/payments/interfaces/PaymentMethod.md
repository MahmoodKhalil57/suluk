[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / PaymentMethod

# Interface: PaymentMethod

Defined in: [tooling/ts/packages/payments/src/types.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/types.ts#L82)

The payment instrument. Extend with wallet / bank-transfer as connectors gain coverage; card + token are the core.
 `token` is a saved/vaulted instrument id (the app's or the processor's vault — the library stores nothing).

## Properties

### card?

> `optional` **card?**: [`CardDetails`](CardDetails.md)

Defined in: [tooling/ts/packages/payments/src/types.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/types.ts#L83)

***

### token?

> `optional` **token?**: [`Secret`](../type-aliases/Secret.md)\<`string`\>

Defined in: [tooling/ts/packages/payments/src/types.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/types.ts#L84)
