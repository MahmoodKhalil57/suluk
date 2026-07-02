[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / resolveOps

# Function: resolveOps()

> **resolveOps**(`doc`): `object`

Defined in: [generate.ts:106](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/sdk/src/generate.ts#L106)

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
