[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / Guard

# Interface: Guard

Defined in: [tooling/ts/packages/hono/src/enforce.ts:94](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L94)

## Properties

### requireAdmin

> **requireAdmin**: `MiddlewareHandler`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L98)

401 if anonymous, else 403 unless the caller is admin.

***

### requireAuth

> **requireAuth**: `MiddlewareHandler`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:96](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L96)

401 unless a verified principal is present.

***

### requireScopes

> **requireScopes**: (...`need`) => `MiddlewareHandler`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:100](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L100)

401 if anonymous, else 403 unless the caller holds EVERY named scope.

#### Parameters

##### need

...`string`[]

#### Returns

`MiddlewareHandler`
