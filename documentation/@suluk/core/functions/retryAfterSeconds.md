[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / retryAfterSeconds

# Function: retryAfterSeconds()

> **retryAfterSeconds**(`facet`): `number`

Defined in: [ratelimit.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/ratelimit.ts#L24)

Retry-After seconds for a budget — `ceil(windowMs / 1000)`, ported from saastarter route-handler.ts:75.
Poison-guarded: a non-finite window yields 0 (never propagates NaN into a header).

## Parameters

### facet

`Pick`\<[`SulukRateLimit`](../interfaces/SulukRateLimit.md), `"windowMs"`\>

## Returns

`number`
