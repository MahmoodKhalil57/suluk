[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / DurableObjectBinding

# Interface: DurableObjectBinding

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/deploy.ts#L14)

A Durable Object class to bind + (for same-script classes) create via an inline script migration. Mirrors
 `@suluk/deploy`'s `DurableObjectBinding` so the CLI plan and the no-wrangler REST deploy describe DO agents alike.

## Properties

### binding

> **binding**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/deploy.ts#L16)

the binding name exposed as `env.<binding>`.

***

### className

> **className**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/deploy.ts#L18)

the exported Agent/DO class name.

***

### scriptName?

> `optional` **scriptName?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/deploy.ts#L22)

cross-script DO: the script that DEFINES the class. Omit for a same-script class (the only kind we migrate).

***

### sqlite?

> `optional` **sqlite?**: `boolean`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/deploy.ts#L20)

SQLite-backed storage — REQUIRED by the Agents SDK + the free plan. Default true ⇒ `new_sqlite_classes`.
