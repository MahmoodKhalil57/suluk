[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / PrincipalOptions

# Interface: PrincipalOptions

Defined in: [principal.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/better-auth/src/principal.ts#L23)

## Properties

### orgRoleScopes?

> `optional` **orgRoleScopes?**: `Record`\<`string`, `string`[]\>

Defined in: [principal.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/better-auth/src/principal.ts#L27)

Map an ORG role → the scopes it grants WITHIN an org (each namespaced to `org:<id>:<scope>`).

***

### roleScopes?

> `optional` **roleScopes?**: `Record`\<`string`, `string`[]\>

Defined in: [principal.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/better-auth/src/principal.ts#L25)

Map a role name → the scopes it grants (e.g. { admin: ["read:*","write:*"], user: ["read:self"] }).
