[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / matchRequest

# Function: matchRequest()

> **matchRequest**(`ada`, `method`, `url`): [`MatchResult`](../interfaces/MatchResult.md) \| `null`

Defined in: [ada.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/ada.ts#L69)

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
