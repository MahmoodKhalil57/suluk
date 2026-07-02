[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / RateLimitStore

# Interface: RateLimitStore

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/ratelimit.ts#L14)

Matches @suluk/hono's RateLimitStore (structural — satisfies enforceRateLimit's `store` without a package dep).

## Methods

### consume()

> **consume**(`key`, `opts`): `Promise`\<[`ConsumeResult`](ConsumeResult.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/ratelimit.ts#L14)

#### Parameters

##### key

`string`

##### opts

[`ConsumeOptions`](ConsumeOptions.md)

#### Returns

`Promise`\<[`ConsumeResult`](ConsumeResult.md)\>
