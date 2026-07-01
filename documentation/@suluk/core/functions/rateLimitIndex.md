[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / rateLimitIndex

# Function: rateLimitIndex()

> **rateLimitIndex**(`doc`): [`RateLimitGroup`](../interfaces/RateLimitGroup.md)[]

Defined in: [ratelimit.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/core/src/ratelimit.ts#L44)

The DERIVED index: every operation that declares a rate-limit budget + its config. Computed by walking the
document; never read back from stored state. The "what is rate-limited, and how?" lookup (reference panels,
deploy-binding provisioning, audit).

## Parameters

### doc

[`OpenAPIv4Document`](../interfaces/OpenAPIv4Document.md)

## Returns

[`RateLimitGroup`](../interfaces/RateLimitGroup.md)[]
