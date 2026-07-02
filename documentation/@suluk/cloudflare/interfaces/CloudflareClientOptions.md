[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / CloudflareClientOptions

# Interface: CloudflareClientOptions

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/client.ts#L22)

`@suluk/cloudflare` — API-driven provisioning + deployment for a Suluk app on Cloudflare, no wrangler CLI. A typed
REST client, idempotent provisioners (D1 / KV / R2 / secrets), the Workers module-script + static-assets upload
flow, and a one-call `deploy()` that wires them in dependency order. The platform that ships itself, shipping
itself — readable, testable, and the same contract-first discipline as the rest of the suite. CANDIDATE tooling.

## Properties

### accountId?

> `optional` **accountId?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/client.ts#L26)

the account id; resolved from the token's first account when omitted.

***

### apiToken

> **apiToken**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/client.ts#L24)

an API token (Bearer). Account-scoped: Workers Scripts + D1 (+ KV/R2) Edit, Account Settings Read.

***

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/client.ts#L30)

API base (default the public Cloudflare API).

***

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/client.ts#L28)

injected fetch (tests pass a recorder); defaults to the global.
