[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / withRedirectTo

# Function: withRedirectTo()

> **withRedirectTo**(`href`, `redirectTo`): `string`

Defined in: [auth-flow.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/auth-flow.ts#L25)

Append a (guarded) `redirectTo` to an href — e.g. point "/login" at the page the user was on, so post-auth
 returns there. A non-safe target is dropped (the href is returned unchanged).

## Parameters

### href

`string`

### redirectTo

`string` \| `null` \| `undefined`

## Returns

`string`
