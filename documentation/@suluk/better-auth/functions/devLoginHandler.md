[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / devLoginHandler

# Function: devLoginHandler()

> **devLoginHandler**(`opts`): `Promise`\<`Response`\>

Defined in: [dev-login.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/better-auth/src/dev-login.ts#L44)

Handle `POST /api/auth/dev-login` with `{ email }`. FAIL-CLOSED: 404 unless `armed` (checked before reading input);
400 for a missing/invalid email; else mint a real session for that email and return the sign-in Response (Set-Cookie).
Never throws on a hostile request.

## Parameters

### opts

[`DevLoginOptions`](../interfaces/DevLoginOptions.md)

## Returns

`Promise`\<`Response`\>
