[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / resolveParams

# Function: resolveParams()

> **resolveParams**(`spec`, `outputsByRef`): `Record`\<`string`, `unknown`\>

Defined in: [provision/src/refs.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/refs.ts#L30)

Resolve a spec's params against the accumulated outputs (ref → its output map). Throws if a referenced output is
 missing (a producer that didn't emit the key) — fail-closed, never silently substitute undefined into a provider call.

## Parameters

### spec

[`InstanceSpec`](../interfaces/InstanceSpec.md)

### outputsByRef

`Record`\<`string`, `Record`\<`string`, `string`\>\>

## Returns

`Record`\<`string`, `unknown`\>
