[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / idempotencyKey

# Function: idempotencyKey()

> **idempotencyKey**(`scope`, `lines`, `discount?`): `string`

Defined in: [tooling/ts/packages/payments/src/pricing.ts:165](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/pricing.ts#L165)

A deterministic idempotency key for a checkout attempt. The SAME cart under the same scope (principal) yields
the SAME key, so a retried "create payment intent" REUSES the existing intent instead of charging twice; a
changed cart yields a new key. Thread this into the processor's idempotency-key header.

## Parameters

### scope

`string`

### lines

[`CartLine`](../interfaces/CartLine.md)[]

### discount?

[`Discount`](../interfaces/Discount.md) \| `null`

## Returns

`string`
