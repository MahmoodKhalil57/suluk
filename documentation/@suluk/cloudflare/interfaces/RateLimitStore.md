[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / RateLimitStore

# Interface: RateLimitStore

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/ratelimit.ts#L14)

Matches @suluk/hono's RateLimitStore (structural — satisfies enforceRateLimit's `store` without a package dep).

## Methods

### consume()

> **consume**(`key`, `opts`): `Promise`\<[`ConsumeResult`](ConsumeResult.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/ratelimit.ts#L14)

#### Parameters

##### key

`string`

##### opts

[`ConsumeOptions`](ConsumeOptions.md)

#### Returns

`Promise`\<[`ConsumeResult`](ConsumeResult.md)\>
