[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / permissionsToScopes

# Function: permissionsToScopes()

> **permissionsToScopes**(`perms`): `string`[]

Defined in: [apikey.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/apikey.ts#L62)

Better Auth permissions → flat scopes. `{ cart: ["read","write"] }` → `["cart:read","cart:write"]`.
DEVIATION from saastarter scopes.ts:167-179 (receipted): the `if (scope in API_SCOPES)` catalog filter is REMOVED.
The scope catalog is APP-domain vocabulary (saastarter's ecommerce products/cart/orders), not auth machinery —
baking a fixed catalog into a candidate-spec package would couple it to one app's domain. An app that wants
catalog-validation filters the result against its own catalog. Lowered ceiling: this is reusable-primitive intent,
not a behavioral port.

## Parameters

### perms

`Record`\<`string`, `string`[]\> \| `null` \| `undefined`

## Returns

`string`[]
