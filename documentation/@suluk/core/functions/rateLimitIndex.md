[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / rateLimitIndex

# Function: rateLimitIndex()

> **rateLimitIndex**(`doc`): [`RateLimitGroup`](../interfaces/RateLimitGroup.md)[]

Defined in: [ratelimit.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/ratelimit.ts#L44)

The DERIVED index: every operation that declares a rate-limit budget + its config. Computed by walking the
document; never read back from stored state. The "what is rate-limited, and how?" lookup (reference panels,
deploy-binding provisioning, audit).

## Parameters

### doc

[`OpenAPIv4Document`](../interfaces/OpenAPIv4Document.md)

## Returns

[`RateLimitGroup`](../interfaces/RateLimitGroup.md)[]
