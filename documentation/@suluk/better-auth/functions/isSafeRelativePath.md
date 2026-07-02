[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / isSafeRelativePath

# Function: isSafeRelativePath()

> **isSafeRelativePath**(`p`): `p is string`

Defined in: [auth-flow.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/auth-flow.ts#L12)

A path is safe to redirect to iff it's a SINGLE-leading-slash relative path (rejects "//host", "http(s)://…",
 backslash tricks, and protocol-relative URLs) — defends against open-redirect.

## Parameters

### p

`string` \| `null` \| `undefined`

## Returns

`p is string`
