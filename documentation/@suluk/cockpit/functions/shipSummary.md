[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / shipSummary

# Function: shipSummary()

> **shipSummary**(`gates`): `object`

Defined in: [cockpit/src/lifecycle.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cockpit/src/lifecycle.ts#L82)

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
