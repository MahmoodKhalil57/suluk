[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / shipSummary

# Function: shipSummary()

> **shipSummary**(`gates`): `object`

Defined in: [cockpit/src/lifecycle.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cockpit/src/lifecycle.ts#L82)

A one-line readiness summary over a set of gates (contract + host). "info" gates never count against ready.

## Parameters

### gates

[`Gate`](../interfaces/Gate.md)[]

## Returns

`object`

### line

> **line**: `string`

### ready

> **ready**: `boolean`
