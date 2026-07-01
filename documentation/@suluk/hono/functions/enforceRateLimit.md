[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / enforceRateLimit

# Function: enforceRateLimit()

> **enforceRateLimit**(`cfg`): `MiddlewareHandler`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:110](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/hono/src/ratelimit.ts#L110)

The facet-driven rate-limit gate. Apply once (typically after identity, alongside enforceAccess): every operation
that DECLARES an `x-suluk-ratelimit` budget is metered; the rest pass untouched. On overflow → 429 + Retry-After.

## Parameters

### cfg

[`EnforceRateLimitConfig`](../interfaces/EnforceRateLimitConfig.md)

## Returns

`MiddlewareHandler`
