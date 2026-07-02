[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / scopesToPermissions

# Function: scopesToPermissions()

> **scopesToPermissions**(`scopes`): `Record`\<`string`, `string`[]\>

Defined in: [apikey.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/apikey.ts#L44)

Flat scopes → Better Auth permissions. `["cart:read","cart:write"]` → `{ cart: ["read","write"] }`.
Ported from saastarter scopes.ts:150-161 — `split(":")` destructures only the first two segments, so a malformed
`"a:b:c"` yields `{ a: ["b"] }` and a segment-less `"x"` is skipped (no action). Faithful to saastarter semantics.

## Parameters

### scopes

`string`[]

## Returns

`Record`\<`string`, `string`[]\>
