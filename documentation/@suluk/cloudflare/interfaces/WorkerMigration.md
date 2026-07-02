[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / WorkerMigration

# Interface: WorkerMigration

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/worker.ts#L21)

A Durable Object migration, INLINE in the script-upload metadata (NOT the D1 `Migration` in resources.ts — that
is SQL run against a database; this is a declarative tag that tells Workers a DO class exists and which storage
backend it uses). NB the wire field is `new_tag` (+ optional `old_tag`), unlike wrangler.jsonc which uses `tag`.
`new_sqlite_classes` is what the Agents SDK + the Workers free plan require; `new_classes` is the legacy KV backend.

## Properties

### deleted\_classes?

> `optional` **deleted\_classes?**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/worker.ts#L31)

***

### new\_classes?

> `optional` **new\_classes?**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/worker.ts#L29)

classes to create with the legacy key-value backend (Paid plan only).

***

### new\_sqlite\_classes?

> `optional` **new\_sqlite\_classes?**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/worker.ts#L27)

classes to create with the SQLite storage backend (Agents SDK requirement).

***

### new\_tag

> **new\_tag**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/worker.ts#L23)

the migration tag this upload advances to (e.g. "v1").

***

### old\_tag?

> `optional` **old\_tag?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/worker.ts#L25)

the tag the server must currently be at — optimistic concurrency; omit on the first deploy.

***

### renamed\_classes?

> `optional` **renamed\_classes?**: `object`[]

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/worker.ts#L30)

#### from

> **from**: `string`

#### to

> **to**: `string`
