[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / policyFor

# Function: policyFor()

> **policyFor**(`access`, `ownerCol?`, `policies?`): [`Policy`](../interfaces/Policy.md)

Defined in: [tooling/ts/packages/hono/src/access.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/hono/src/access.ts#L36)

The policy for an access mode (default: owned when an ownerCol is present, else public). `policies` overrides the preset.

## Parameters

### access

[`AccessMode`](../type-aliases/AccessMode.md) \| `undefined`

### ownerCol?

`string`

### policies?

`Record`\<[`AccessMode`](../type-aliases/AccessMode.md), [`Policy`](../interfaces/Policy.md)\> = `DEFAULT_POLICIES`

## Returns

[`Policy`](../interfaces/Policy.md)
