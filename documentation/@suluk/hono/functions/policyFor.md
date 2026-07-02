[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / policyFor

# Function: policyFor()

> **policyFor**(`access`, `ownerCol?`, `policies?`): [`Policy`](../interfaces/Policy.md)

Defined in: [tooling/ts/packages/hono/src/access.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/access.ts#L36)

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
