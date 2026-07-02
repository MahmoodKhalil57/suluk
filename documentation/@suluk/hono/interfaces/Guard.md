[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / Guard

# Interface: Guard

Defined in: [tooling/ts/packages/hono/src/enforce.ts:94](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/enforce.ts#L94)

## Properties

### requireAdmin

> **requireAdmin**: `MiddlewareHandler`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/enforce.ts#L98)

401 if anonymous, else 403 unless the caller is admin.

***

### requireAuth

> **requireAuth**: `MiddlewareHandler`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:96](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/enforce.ts#L96)

401 unless a verified principal is present.

***

### requireScopes

> **requireScopes**: (...`need`) => `MiddlewareHandler`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:100](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/enforce.ts#L100)

401 if anonymous, else 403 unless the caller holds EVERY named scope.

#### Parameters

##### need

...`string`[]

#### Returns

`MiddlewareHandler`
