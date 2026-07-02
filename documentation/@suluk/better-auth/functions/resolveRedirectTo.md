[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / resolveRedirectTo

# Function: resolveRedirectTo()

> **resolveRedirectTo**(`search`, `fallback?`): `string`

Defined in: [auth-flow.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/auth-flow.ts#L17)

Read `redirectTo` from a query string / URLSearchParams; return it only if same-origin-relative, else `fallback`.

## Parameters

### search

`string` \| `URLSearchParams`

### fallback?

`string` = `"/"`

## Returns

`string`
