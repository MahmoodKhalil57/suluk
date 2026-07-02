[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / emailVerificationConfig

# Function: emailVerificationConfig()

> **emailVerificationConfig**(`opts`): `object`

Defined in: [auth-flow.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/auth-flow.ts#L41)

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
