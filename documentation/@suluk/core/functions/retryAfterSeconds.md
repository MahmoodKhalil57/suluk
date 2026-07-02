[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / retryAfterSeconds

# Function: retryAfterSeconds()

> **retryAfterSeconds**(`facet`): `number`

Defined in: [ratelimit.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/ratelimit.ts#L24)

Retry-After seconds for a budget — `ceil(windowMs / 1000)`, ported from saastarter route-handler.ts:75.
Poison-guarded: a non-finite window yields 0 (never propagates NaN into a header).

## Parameters

### facet

`Pick`\<[`SulukRateLimit`](../interfaces/SulukRateLimit.md), `"windowMs"`\>

## Returns

`number`
