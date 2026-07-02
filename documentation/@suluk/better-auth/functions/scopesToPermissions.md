[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / scopesToPermissions

# Function: scopesToPermissions()

> **scopesToPermissions**(`scopes`): `Record`\<`string`, `string`[]\>

Defined in: [apikey.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/better-auth/src/apikey.ts#L44)

Flat scopes → Better Auth permissions. `["cart:read","cart:write"]` → `{ cart: ["read","write"] }`.
Ported from saastarter scopes.ts:150-161 — `split(":")` destructures only the first two segments, so a malformed
`"a:b:c"` yields `{ a: ["b"] }` and a segment-less `"x"` is skipped (no action). Faithful to saastarter semantics.

## Parameters

### scopes

`string`[]

## Returns

`Record`\<`string`, `string`[]\>
