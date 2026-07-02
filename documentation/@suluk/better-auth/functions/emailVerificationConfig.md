[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / emailVerificationConfig

# Function: emailVerificationConfig()

> **emailVerificationConfig**(`opts`): `object`

Defined in: [auth-flow.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/better-auth/src/auth-flow.ts#L41)

A Better Auth `emailVerification` block with frictionless-activation defaults. Spread into
 `betterAuth({ emailVerification: emailVerificationConfig({ sendVerificationEmail }) })`.

## Parameters

### opts

[`EmailVerificationOptions`](../interfaces/EmailVerificationOptions.md)

## Returns

`object`

### autoSignInAfterVerification

> **autoSignInAfterVerification**: `boolean`

### sendOnSignUp

> **sendOnSignUp**: `boolean`

### sendVerificationEmail

> **sendVerificationEmail**: (`data`) => `void` \| `Promise`\<`void`\> = `opts.sendVerificationEmail`

#### Parameters

##### data

###### token?

`string`

###### url

`string`

###### user

\{ `email`: `string`; \}

###### user.email

`string`

#### Returns

`void` \| `Promise`\<`void`\>
