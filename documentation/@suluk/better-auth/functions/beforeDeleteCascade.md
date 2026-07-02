[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / beforeDeleteCascade

# Function: beforeDeleteCascade()

> **beforeDeleteCascade**\<`U`\>(`steps`, `opts?`): (`user`) => `Promise`\<`void`\>

Defined in: [erasure.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/better-auth/src/erasure.ts#L49)

Build the Better Auth `user.deleteUser.beforeDelete` hook (options.ts:127) from an ordered erasure cascade.
Runs each step in order; on a step error it logs and — unless `continueOnError` — rethrows to ABORT (so the user
is NOT deleted when cleanup failed, never orphaning their external records).

## Type Parameters

### U

`U`

## Parameters

### steps

[`CascadeStep`](../interfaces/CascadeStep.md)\<`U`\>[]

### opts?

[`CascadeOptions`](../interfaces/CascadeOptions.md) = `{}`

## Returns

(`user`) => `Promise`\<`void`\>
