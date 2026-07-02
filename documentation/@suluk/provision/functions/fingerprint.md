[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / fingerprint

# Function: fingerprint()

> **fingerprint**(`spec`): `string`

Defined in: [provision/src/refs.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/refs.ts#L58)

The drift fingerprint of a desired instance = a stable hash of (name + plan + params). A change flips it → an `update`
 step; an unchanged spec matches its stored fingerprint → a `noop`. (Refs are fingerprinted as their literal `@ref.key`
 text — a producer's VALUE changing is the producer's own drift, surfaced on its own step.)

## Parameters

### spec

[`InstanceSpec`](../interfaces/InstanceSpec.md)

## Returns

`string`
