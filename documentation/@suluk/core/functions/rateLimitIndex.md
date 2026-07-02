[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / rateLimitIndex

# Function: rateLimitIndex()

> **rateLimitIndex**(`doc`): [`RateLimitGroup`](../interfaces/RateLimitGroup.md)[]

Defined in: [ratelimit.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/ratelimit.ts#L44)

The DERIVED index: every operation that declares a rate-limit budget + its config. Computed by walking the
document; never read back from stored state. The "what is rate-limited, and how?" lookup (reference panels,
deploy-binding provisioning, audit).

## Parameters

### doc

[`OpenAPIv4Document`](../interfaces/OpenAPIv4Document.md)

## Returns

[`RateLimitGroup`](../interfaces/RateLimitGroup.md)[]
