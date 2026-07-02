[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / PreviewLoginOptions

# Interface: PreviewLoginOptions

Defined in: [preview.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/preview.ts#L40)

## Properties

### allowedRoles

> **allowedRoles**: `string`[]

Defined in: [preview.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/preview.ts#L43)

The roles a preview may assume — derive from the contract (cockpit previewRoles), NEVER a hardcoded list.
 A requested role MUST be a member; "anonymous" is handled by the launcher (it opens the app with no login).

***

### mintSession

> **mintSession**: (`role`) => [`MintedSession`](MintedSession.md) \| `Promise`\<[`MintedSession`](MintedSession.md)\>

Defined in: [preview.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/preview.ts#L46)

Establish a role-scoped session for the SEEDED demo user of `role` (looks it up in env.PREVIEW_DB).
 This is the only code that touches a session; it must bind to a seeded throwaway row, never a real user.

#### Parameters

##### role

`string`

#### Returns

[`MintedSession`](MintedSession.md) \| `Promise`\<[`MintedSession`](MintedSession.md)\>

***

### redirectTo?

> `optional` **redirectTo?**: `string`

Defined in: [preview.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/preview.ts#L48)

Where to land after login (default "/").
