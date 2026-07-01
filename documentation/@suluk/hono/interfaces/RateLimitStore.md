[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / RateLimitStore

# Interface: RateLimitStore

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/hono/src/ratelimit.ts#L45)

The swap point for a durable counter. `consume` atomically records one hit for `key` under the budget and
reports whether it's now over. A production impl (KV / Durable Object) MUST be atomic-per-key; the in-memory
default is per-instance and NOT durable, so it is dev-only.

## Methods

### consume()

> **consume**(`key`, `opts`): [`RateLimitResult`](RateLimitResult.md) \| `Promise`\<[`RateLimitResult`](RateLimitResult.md)\>

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/hono/src/ratelimit.ts#L46)

#### Parameters

##### key

`string`

##### opts

[`RateLimitConsumeOptions`](RateLimitConsumeOptions.md)

#### Returns

[`RateLimitResult`](RateLimitResult.md) \| `Promise`\<[`RateLimitResult`](RateLimitResult.md)\>
