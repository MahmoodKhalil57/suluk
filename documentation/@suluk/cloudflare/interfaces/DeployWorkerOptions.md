[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / DeployWorkerOptions

# Interface: DeployWorkerOptions

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L34)

## Properties

### assets?

> `optional` **assets?**: `object`

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L49)

the static-assets completion JWT (from uploadAssets) + the binding name + assets config.

#### binding?

> `optional` **binding?**: `string`

#### config?

> `optional` **config?**: `Record`\<`string`, `unknown`\>

#### jwt

> **jwt**: `string` \| `null`

***

### bindings?

> `optional` **bindings?**: [`WorkerBinding`](WorkerBinding.md)[]

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L43)

typed bindings (d1, kv_namespace, r2_bucket, durable_object_namespace, …).

***

### compatibilityDate

> **compatibilityDate**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L40)

***

### compatibilityFlags?

> `optional` **compatibilityFlags?**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L41)

***

### keepBindings?

> `optional` **keepBindings?**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L53)

preserve bindings of these types from the prior version (default keeps secrets across deploys).

***

### mainModule?

> `optional` **mainModule?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L39)

the module filename referenced as `main_module` (default "worker.js").

***

### migrations?

> `optional` **migrations?**: [`WorkerMigration`](WorkerMigration.md)[]

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L45)

Durable Object migrations — ride inline on THIS script upload (no separate call). Omit when there are none.

***

### module

> **module**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L37)

the bundled ES-module source.

***

### name

> **name**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L35)

***

### observability?

> `optional` **observability?**: `boolean`

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L51)

enable Workers observability (logs/traces).

***

### vars?

> `optional` **vars?**: `Record`\<`string`, `string`\>

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/worker.ts#L47)

plain-text vars → `plain_text` bindings.
