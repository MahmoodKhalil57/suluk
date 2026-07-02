[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / retryAfterSeconds

# Function: retryAfterSeconds()

> **retryAfterSeconds**(`facet`): `number`

Defined in: [ratelimit.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/ratelimit.ts#L24)

Retry-After seconds for a budget — `ceil(windowMs / 1000)`, ported from saastarter route-handler.ts:75.
Poison-guarded: a non-finite window yields 0 (never propagates NaN into a header).

## Parameters

### facet

`Pick`\<[`SulukRateLimit`](../interfaces/SulukRateLimit.md), `"windowMs"`\>

## Returns

`number`
