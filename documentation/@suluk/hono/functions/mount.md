[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / mount

# Function: mount()

> **mount**\<`T`\>(`app`, `routes`): `T`

Defined in: [tooling/ts/packages/hono/src/mount.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/hono/src/mount.ts#L13)

Mount each contract's handler (with request validation derived from its Zod schemas) onto `app`.

## Type Parameters

### T

`T` *extends* `Hono`\<`BlankEnv`, `BlankSchema`, `"/"`\>

## Parameters

### app

`T`

### routes

readonly [`RouteContract`](../interfaces/RouteContract.md)[]

## Returns

`T`
