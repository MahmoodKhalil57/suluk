[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / SessionLike

# Interface: SessionLike

Defined in: [principal.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/principal.ts#L12)

A minimal view of a Better Auth session (duck-typed; works with the real Session shape).

## Properties

### apiKey?

> `optional` **apiKey?**: \{ `permissions?`: `Record`\<`string`, `string`[]\>; `scopes?`: `string`[]; \} \| `null`

Defined in: [principal.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/principal.ts#L15)

apiKey plugin: a key carries its own permissions/scopes.

***

### organizations?

> `optional` **organizations?**: `object`[]

Defined in: [principal.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/principal.ts#L20)

organization plugin: memberships → `org:<id>:<scope>` scopes (Phase 1, tenancy via scope-encoding).

#### id

> **id**: `string`

#### role?

> `optional` **role?**: `string`

#### scopes?

> `optional` **scopes?**: `string`[]

***

### scopes?

> `optional` **scopes?**: `string`[]

Defined in: [principal.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/principal.ts#L16)

***

### twoFactorVerified?

> `optional` **twoFactorVerified?**: `boolean`

Defined in: [principal.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/principal.ts#L18)

twoFactor plugin: the session has cleared its second factor ⇒ the `mfa:verified` scope (Phase 1).

***

### user?

> `optional` **user?**: \{ `role?`: `string` \| `string`[]; `scopes?`: `string`[]; \} \| `null`

Defined in: [principal.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/principal.ts#L13)
