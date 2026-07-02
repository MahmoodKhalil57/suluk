[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / ClientSession

# Interface: ClientSession

Defined in: [tooling/ts/packages/payments/src/types.ts:192](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L192)

A browser-confirmable session: the server creates the intent, the browser SDK confirms it with `clientSecret`, so raw
card data never touches the server (PCI-scope reduction). Crediting lands on the processor webhook, not the create
call. This is the piece a pure server-side `authorize` can't express — the Payment-Element / one-click / add-card flows.

## Properties

### clientSecret

> **clientSecret**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:194](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L194)

the token the browser SDK confirms with — Stripe's `client_secret`; another processor's equivalent.

***

### connectorTransactionId?

> `optional` **connectorTransactionId?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:195](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L195)

***

### customerId?

> `optional` **customerId?**: `string`

Defined in: [tooling/ts/packages/payments/src/types.ts:196](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L196)
