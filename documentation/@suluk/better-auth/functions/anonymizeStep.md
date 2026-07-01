[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / anonymizeStep

# Function: anonymizeStep()

> **anonymizeStep**\<`U`\>(`name`, `run`): [`CascadeStep`](../interfaces/CascadeStep.md)\<`U`\>

Defined in: [erasure.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/better-auth/src/erasure.ts#L35)

An ANONYMIZE step — keep the row, scrub its PII (the FK-safe posture; recommended default).

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
