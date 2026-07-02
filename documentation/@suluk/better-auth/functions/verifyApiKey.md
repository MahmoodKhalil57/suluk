[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / verifyApiKey

# Function: verifyApiKey()

> **verifyApiKey**(`verifier`, `key`, `opts?`): `Promise`\<[`VerifyApiKeyResult`](../interfaces/VerifyApiKeyResult.md)\>

Defined in: [apikey.ts:112](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/better-auth/src/apikey.ts#L112)

Verify an API key (optionally requiring scopes) and return a `{ scopes }` Principal.

DEVIATION from saastarter (receipted): saastarter never derives IDENTITY from `verifyApiKey` — identity comes from
the session, and `verifyApiKey` is used ONLY to check scopes (services/auth.ts:133-147). Suluk's key-auth-only
path uses the verified key's `userId` + `permissions` AS the Principal — an invented composition for stateless API
callers that have no session. Result-returning (not throwing) to match the package idiom (preview.ts/principal.ts).

## Parameters

### verifier

[`ApiKeyVerifierLike`](../interfaces/ApiKeyVerifierLike.md)

### key

`string`

### opts?

[`VerifyApiKeyOptions`](../interfaces/VerifyApiKeyOptions.md) = `{}`

## Returns

`Promise`\<[`VerifyApiKeyResult`](../interfaces/VerifyApiKeyResult.md)\>
