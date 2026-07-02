[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / withRedirectTo

# Function: withRedirectTo()

> **withRedirectTo**(`href`, `redirectTo`): `string`

Defined in: [auth-flow.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/auth-flow.ts#L25)

Append a (guarded) `redirectTo` to an href — e.g. point "/login" at the page the user was on, so post-auth
 returns there. A non-safe target is dropped (the href is returned unchanged).

## Parameters

### href

`string`

### redirectTo

`string` \| `null` \| `undefined`

## Returns

`string`
