[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / kvRateLimitStore

# Function: kvRateLimitStore()

> **kvRateLimitStore**(`kv`, `opts?`): [`RateLimitStore`](../interfaces/RateLimitStore.md)

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cloudflare/src/ratelimit.ts#L37)

Build a KV-backed RateLimitStore. `kv` is the namespace, or a getter (lazy — capture the binding on first request).
Falls open to `opts.fallback` (default a per-instance memory store) when KV is absent or errors.

## Parameters

### kv

[`KvLike`](../interfaces/KvLike.md) \| (() => [`KvLike`](../interfaces/KvLike.md) \| `undefined`) \| `undefined`

### opts?

#### fallback?

[`RateLimitStore`](../interfaces/RateLimitStore.md)

## Returns

[`RateLimitStore`](../interfaces/RateLimitStore.md)
