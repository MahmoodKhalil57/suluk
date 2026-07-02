[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / EmailVerificationOptions

# Interface: EmailVerificationOptions

Defined in: [auth-flow.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/auth-flow.ts#L30)

## Properties

### autoSignIn?

> `optional` **autoSignIn?**: `boolean`

Defined in: [auth-flow.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/auth-flow.ts#L34)

sign the user in automatically after they click the verification link (default true — frictionless).

***

### sendOnSignUp?

> `optional` **sendOnSignUp?**: `boolean`

Defined in: [auth-flow.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/auth-flow.ts#L36)

send a verification email on sign-up (default true).

***

### sendVerificationEmail

> **sendVerificationEmail**: (`data`) => `void` \| `Promise`\<`void`\>

Defined in: [auth-flow.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/auth-flow.ts#L32)

send the verification email — bind to your branded-email builder.

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
