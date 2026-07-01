[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / matchRequest

# Function: matchRequest()

> **matchRequest**(`ada`, `method`, `url`): [`MatchResult`](../interfaces/MatchResult.md) \| `null`

Defined in: [ada.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/core/src/ada.ts#L69)

Match a concrete HTTP request (method + URL) to zero-or-one operation (CONFORMANCE §B.3).
Recognition direction: reverse-parse the path, filter by method; concrete-over-variable is a runtime
tiebreak (fewest path variables wins). Returns null if no operation matches.

## Parameters

### ada

[`Ada`](../interfaces/Ada.md)

### method

`string`

### url

`string`

## Returns

[`MatchResult`](../interfaces/MatchResult.md) \| `null`
