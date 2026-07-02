[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / ApiKeyVerifierLike

# Interface: ApiKeyVerifierLike

Defined in: [apikey.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/better-auth/src/apikey.ts#L72)

A duck-typed view of Better Auth's server `verifyApiKey` (the app injects `betterAuth.api`).

## Methods

### verifyApiKey()

> **verifyApiKey**(`args`): `Promise`\<\{ `error?`: \{ `code?`: `string`; `message?`: `string`; \} \| `null`; `key?`: \{ `id?`: `string`; `metadata?`: `unknown`; `name?`: `string`; `permissions?`: `Record`\<`string`, `string`[]\> \| `null`; `userId?`: `string`; \} \| `null`; `valid`: `boolean`; \}\>

Defined in: [apikey.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/better-auth/src/apikey.ts#L73)

#### Parameters

##### args

###### body

\{ `key`: `string`; `permissions?`: `Record`\<`string`, `string`[]\>; \}

###### body.key

`string`

###### body.permissions?

`Record`\<`string`, `string`[]\>

#### Returns

`Promise`\<\{ `error?`: \{ `code?`: `string`; `message?`: `string`; \} \| `null`; `key?`: \{ `id?`: `string`; `metadata?`: `unknown`; `name?`: `string`; `permissions?`: `Record`\<`string`, `string`[]\> \| `null`; `userId?`: `string`; \} \| `null`; `valid`: `boolean`; \}\>
