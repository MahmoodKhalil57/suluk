[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / mount

# Function: mount()

> **mount**\<`T`\>(`app`, `routes`): `T`

Defined in: [tooling/ts/packages/hono/src/mount.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/hono/src/mount.ts#L13)

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
