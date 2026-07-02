[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / deleteStep

# Function: deleteStep()

> **deleteStep**\<`U`\>(`name`, `run`): [`CascadeStep`](../interfaces/CascadeStep.md)\<`U`\>

Defined in: [erasure.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/erasure.ts#L40)

A hard-DELETE step — cascade-remove a subsystem's rows for the user.

## Type Parameters

### U

`U`

## Parameters

### name

`string`

### run

(`user`) => `void` \| `Promise`\<`void`\>

## Returns

[`CascadeStep`](../interfaces/CascadeStep.md)\<`U`\>
