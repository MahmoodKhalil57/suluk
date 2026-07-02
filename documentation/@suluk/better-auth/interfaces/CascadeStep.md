[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / CascadeStep

# Interface: CascadeStep\<U\>

Defined in: [erasure.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/erasure.ts#L14)

One step of the erasure cascade — the erasure of one subsystem for one user.

## Type Parameters

### U

`U`

## Properties

### name

> **name**: `string`

Defined in: [erasure.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/erasure.ts#L16)

a label for logs/diagnostics.

***

### run

> **run**: (`user`) => `void` \| `Promise`\<`void`\>

Defined in: [erasure.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/erasure.ts#L18)

perform the erasure. Put any in-step recovery (already-deleted → fallback) HERE, not in the orchestrator.

#### Parameters

##### user

`U`

#### Returns

`void` \| `Promise`\<`void`\>
