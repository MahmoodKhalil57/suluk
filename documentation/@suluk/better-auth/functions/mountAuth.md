[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / mountAuth

# Function: mountAuth()

> **mountAuth**\<`T`\>(`app`, `auth`, `opts?`): `T`

Defined in: [mount.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/better-auth/src/mount.ts#L23)

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
