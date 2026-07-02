[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / devLoginHandler

# Function: devLoginHandler()

> **devLoginHandler**(`opts`): `Promise`\<`Response`\>

Defined in: [dev-login.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/better-auth/src/dev-login.ts#L44)

Handle `POST /api/auth/dev-login` with `{ email }`. FAIL-CLOSED: 404 unless `armed` (checked before reading input);
400 for a missing/invalid email; else mint a real session for that email and return the sign-in Response (Set-Cookie).
Never throws on a hostile request.

## Parameters

### opts

[`DevLoginOptions`](../interfaces/DevLoginOptions.md)

## Returns

`Promise`\<`Response`\>
