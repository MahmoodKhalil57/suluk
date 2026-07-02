[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / RateLimitStore

# Interface: RateLimitStore

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/ratelimit.ts#L14)

Matches @suluk/hono's RateLimitStore (structural — satisfies enforceRateLimit's `store` without a package dep).

## Methods

### consume()

> **consume**(`key`, `opts`): `Promise`\<[`ConsumeResult`](ConsumeResult.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/ratelimit.ts#L14)

#### Parameters

##### key

`string`

##### opts

[`ConsumeOptions`](ConsumeOptions.md)

#### Returns

`Promise`\<[`ConsumeResult`](ConsumeResult.md)\>
