[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / DevLoginAuthLike

# Interface: DevLoginAuthLike

Defined in: [dev-login.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/better-auth/src/dev-login.ts#L15)

The Better Auth surface this needs — its public `signUpEmail`/`signInEmail` server endpoints. Duck-typed.

## Properties

### api

> **api**: `object`

Defined in: [dev-login.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/better-auth/src/dev-login.ts#L16)

#### signInEmail()

> **signInEmail**(`input`): `Promise`\<`Response`\>

##### Parameters

###### input

###### asResponse

`true`

###### body

\{ `email`: `string`; `password`: `string`; \}

###### body.email

`string`

###### body.password

`string`

##### Returns

`Promise`\<`Response`\>

#### signUpEmail()

> **signUpEmail**(`input`): `Promise`\<`unknown`\>

##### Parameters

###### input

###### body

\{ `email`: `string`; `name`: `string`; `password`: `string`; \}

###### body.email

`string`

###### body.name

`string`

###### body.password

`string`

##### Returns

`Promise`\<`unknown`\>
