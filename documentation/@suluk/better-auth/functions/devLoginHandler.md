[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / devLoginHandler

# Function: devLoginHandler()

> **devLoginHandler**(`opts`): `Promise`\<`Response`\>

Defined in: [dev-login.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/dev-login.ts#L44)

Handle `POST /api/auth/dev-login` with `{ email }`. FAIL-CLOSED: 404 unless `armed` (checked before reading input);
400 for a missing/invalid email; else mint a real session for that email and return the sign-in Response (Set-Cookie).
Never throws on a hostile request.

## Parameters

### opts

[`DevLoginOptions`](../interfaces/DevLoginOptions.md)

## Returns

`Promise`\<`Response`\>
