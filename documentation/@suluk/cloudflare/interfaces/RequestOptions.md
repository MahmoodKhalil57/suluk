[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / RequestOptions

# Interface: RequestOptions

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/client.ts#L33)

`@suluk/cloudflare` — API-driven provisioning + deployment for a Suluk app on Cloudflare, no wrangler CLI. A typed
REST client, idempotent provisioners (D1 / KV / R2 / secrets), the Workers module-script + static-assets upload
flow, and a one-call `deploy()` that wires them in dependency order. The platform that ships itself, shipping
itself — readable, testable, and the same contract-first discipline as the rest of the suite. CANDIDATE tooling.

## Properties

### body?

> `optional` **body?**: `BodyInit`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/client.ts#L37)

a raw body (e.g. FormData / multipart) — takes precedence over `json`.

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/client.ts#L39)

extra headers.

***

### json?

> `optional` **json?**: `unknown`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/client.ts#L35)

a JSON body (sets content-type + serializes).

***

### query?

> `optional` **query?**: `Record`\<`string`, `string` \| `number` \| `boolean` \| `undefined`\>

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/client.ts#L41)

query params.

***

### token?

> `optional` **token?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/client.ts#L43)

override the Bearer token (e.g. an assets-upload JWT).
