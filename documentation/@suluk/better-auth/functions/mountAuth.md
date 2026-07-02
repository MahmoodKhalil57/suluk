[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / mountAuth

# Function: mountAuth()

> **mountAuth**\<`T`\>(`app`, `auth`, `opts?`): `T`

Defined in: [mount.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/mount.ts#L23)

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
