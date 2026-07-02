[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / VerifyApiKeyOptions

# Interface: VerifyApiKeyOptions

Defined in: [apikey.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/better-auth/src/apikey.ts#L99)

## Properties

### requireScopes?

> `optional` **requireScopes?**: `string`[]

Defined in: [apikey.ts:101](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/better-auth/src/apikey.ts#L101)

require the key to carry these scopes (checked in the SAME call via Better Auth `permissions`, services/auth.ts:133-147).
