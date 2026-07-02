[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / mountAuth

# Function: mountAuth()

> **mountAuth**\<`T`\>(`app`, `auth`, `opts?`): `T`

Defined in: [mount.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/mount.ts#L23)

Mount the Better Auth handler onto a Hono app under basePath/* (default /api/auth/*).

## Type Parameters

### T

`T` *extends* [`HonoLike`](../interfaces/HonoLike.md)

## Parameters

### app

`T`

### auth

[`AuthHandlerLike`](../interfaces/AuthHandlerLike.md)

### opts?

[`MountAuthOptions`](../interfaces/MountAuthOptions.md) = `{}`

## Returns

`T`
