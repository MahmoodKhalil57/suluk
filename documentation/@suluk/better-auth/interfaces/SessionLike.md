[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / SessionLike

# Interface: SessionLike

Defined in: [principal.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/better-auth/src/principal.ts#L22)

A minimal view of a Better Auth session (duck-typed; works with the real Session shape).

## Properties

### apiKey?

> `optional` **apiKey?**: \{ `permissions?`: `Record`\<`string`, `string`[]\>; `scopes?`: `string`[]; \} \| `null`

Defined in: [principal.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/better-auth/src/principal.ts#L25)

apiKey plugin: a key carries its own permissions/scopes.

***

### organizations?

> `optional` **organizations?**: `object`[]

Defined in: [principal.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/better-auth/src/principal.ts#L30)

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

Defined in: [principal.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/better-auth/src/principal.ts#L26)

***

### twoFactorVerified?

> `optional` **twoFactorVerified?**: `boolean`

Defined in: [principal.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/better-auth/src/principal.ts#L28)

twoFactor plugin: the session has cleared its second factor ⇒ the `mfa:verified` scope (Phase 1).

***

### user?

> `optional` **user?**: \{ `role?`: `string` \| `string`[]; `scopes?`: `string`[]; \} \| `null`

Defined in: [principal.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/better-auth/src/principal.ts#L23)
