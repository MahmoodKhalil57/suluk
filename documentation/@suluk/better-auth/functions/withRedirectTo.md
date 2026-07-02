[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / withRedirectTo

# Function: withRedirectTo()

> **withRedirectTo**(`href`, `redirectTo`): `string`

Defined in: [auth-flow.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/better-auth/src/auth-flow.ts#L25)

Append a (guarded) `redirectTo` to an href — e.g. point "/login" at the page the user was on, so post-auth
 returns there. A non-safe target is dropped (the href is returned unchanged).

## Parameters

### href

`string`

### redirectTo

`string` \| `null` \| `undefined`

## Returns

`string`
