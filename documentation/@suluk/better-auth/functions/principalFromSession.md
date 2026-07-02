[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / principalFromSession

# Function: principalFromSession()

> **principalFromSession**(`session`, `opts?`): [`Principal`](../interfaces/Principal.md)

Defined in: [principal.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/principal.ts#L50)

Extract a { scopes } principal from a Better Auth session. Null/undefined session ⇒ anonymous (no scopes).
Beyond the user/apiKey scopes, it encodes MFA + org state AS scopes (Phase 1): a 2FA-cleared session gains
`mfa:verified`, and each org membership contributes `org:<id>:<scope>` (explicit + role-mapped) — so a route
gates 2FA/tenancy through the same scope check enforceAccess already does, no richer Principal type required.

## Parameters

### session

[`SessionLike`](../interfaces/SessionLike.md) \| `null` \| `undefined`

### opts?

[`PrincipalOptions`](../interfaces/PrincipalOptions.md) = `{}`

## Returns

[`Principal`](../interfaces/Principal.md)
