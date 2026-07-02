[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / CrudHandlerOptions

# Interface: CrudHandlerOptions

Defined in: [handlers.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L30)

## Properties

### access?

> `optional` **access?**: [`AccessMode`](../../hono/type-aliases/AccessMode.md)

Defined in: [handlers.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L32)

***

### afterUpdate?

> `optional` **afterUpdate?**: (`tableName`, `c`, `db`, `before`, `after`) => `Promise`\<`void`\>

Defined in: [handlers.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L44)

post-update hook (e.g. back-in-stock on a restock); fires only for tables in `afterUpdateTables`.

#### Parameters

##### tableName

`string`

##### c

`Context`

##### db

[`CrudDb`](CrudDb.md)

##### before

`AnyRow`

##### after

`AnyRow`

#### Returns

`Promise`\<`void`\>

***

### afterUpdateTables?

> `optional` **afterUpdateTables?**: `ReadonlySet`\<`string`\>

Defined in: [handlers.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L45)

***

### db

> **db**: (`c`) => [`CrudDb`](CrudDb.md)

Defined in: [handlers.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L36)

resolve the drizzle instance for a request (dev: `() => db`; worker: `(c) => drizzle(c.env.DB)`).

#### Parameters

##### c

`Context`

#### Returns

[`CrudDb`](CrudDb.md)

***

### isAdmin

> **isAdmin**: (`c`) => `boolean`

Defined in: [handlers.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L40)

whether the caller is an admin (e.g. `c.get("isAdmin") === true`).

#### Parameters

##### c

`Context`

#### Returns

`boolean`

***

### ownerCol?

> `optional` **ownerCol?**: `string`

Defined in: [handlers.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L31)

***

### policies?

> `optional` **policies?**: `Record`\<[`AccessMode`](../../hono/type-aliases/AccessMode.md), [`Policy`](../../hono/interfaces/Policy.md)\>

Defined in: [handlers.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L34)

override the default mode→policy preset (passed through to @suluk/hono's policyFor).

***

### principal

> **principal**: (`c`) => `string` \| `null`

Defined in: [handlers.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L38)

the verified caller id (token/session/x-user) — used for owner-scoping + the create owner-stamp.

#### Parameters

##### c

`Context`

#### Returns

`string` \| `null`

***

### redact?

> `optional` **redact?**: (`tableName`, `row`, `admin`) => `AnyRow`

Defined in: [handlers.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L42)

strip private columns from a row for a non-admin reader (no-op by default).

#### Parameters

##### tableName

`string`

##### row

`AnyRow`

##### admin

`boolean`

#### Returns

`AnyRow`
