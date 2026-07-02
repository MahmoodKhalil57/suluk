[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / resolveOps

# Function: resolveOps()

> **resolveOps**(`doc`): `object`

Defined in: [generate.ts:106](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/sdk/src/generate.ts#L106)

walkOps + DETERMINISTIC method-name collision resolution — SHARED by generateSdk AND generateStores so the client
accessor names (`client.<ns>.<member>`) can NEVER drift between the two projections. Mutates `op.member` in place;
returns the resolved ops + the human-readable collision list (for the SDK header). One source of accessor identity.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

`object`

### collisions

> **collisions**: `string`[]

### ops

> **ops**: [`OpInfo`](../interfaces/OpInfo.md)[]
