[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / CloudflareClient

# Class: CloudflareClient

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/cloudflare/src/client.ts#L48)

`@suluk/cloudflare` — API-driven provisioning + deployment for a Suluk app on Cloudflare, no wrangler CLI. A typed
REST client, idempotent provisioners (D1 / KV / R2 / secrets), the Workers module-script + static-assets upload
flow, and a one-call `deploy()` that wires them in dependency order. The platform that ships itself, shipping
itself — readable, testable, and the same contract-first discipline as the rest of the suite. CANDIDATE tooling.

## Constructors

### Constructor

> **new CloudflareClient**(`opts`): `CloudflareClient`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/cloudflare/src/client.ts#L54)

#### Parameters

##### opts

[`CloudflareClientOptions`](../interfaces/CloudflareClientOptions.md)

#### Returns

`CloudflareClient`

## Properties

### accountId

> **accountId**: `string` \| `undefined`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/cloudflare/src/client.ts#L52)

## Methods

### request()

> **request**\<`T`\>(`method`, `path`, `opts?`): `Promise`\<`T`\>

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/cloudflare/src/client.ts#L63)

Make a request and return the unwrapped `result`, throwing a CloudflareError when `success` is false.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### method

`string`

##### path

`string`

##### opts?

[`RequestOptions`](../interfaces/RequestOptions.md) = `{}`

#### Returns

`Promise`\<`T`\>

***

### requestText()

> **requestText**(`method`, `path`, `opts?`): `Promise`\<`string` \| `null`\>

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/cloudflare/src/client.ts#L82)

Like [request](#request) but returns the RAW body (no `{success,result}` envelope) — for KV value reads, which
 return the stored value directly. Returns null on 404 (key not found). Never echoes the body into an error.

#### Parameters

##### method

`string`

##### path

`string`

##### opts?

[`RequestOptions`](../interfaces/RequestOptions.md) = `{}`

#### Returns

`Promise`\<`string` \| `null`\>

***

### resolveAccountId()

> **resolveAccountId**(): `Promise`\<`string`\>

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/cloudflare/src/client.ts#L97)

Resolve (and cache) the account id — the first account the token can see, unless one was supplied.

#### Returns

`Promise`\<`string`\>
