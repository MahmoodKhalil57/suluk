[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / resolveParams

# Function: resolveParams()

> **resolveParams**(`spec`, `outputsByRef`): `Record`\<`string`, `unknown`\>

Defined in: [provision/src/refs.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/refs.ts#L30)

Resolve a spec's params against the accumulated outputs (ref → its output map). Throws if a referenced output is
 missing (a producer that didn't emit the key) — fail-closed, never silently substitute undefined into a provider call.

## Parameters

### spec

[`InstanceSpec`](../interfaces/InstanceSpec.md)

### outputsByRef

`Record`\<`string`, `Record`\<`string`, `string`\>\>

## Returns

`Record`\<`string`, `unknown`\>
