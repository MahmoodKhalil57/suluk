[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / VerifyApiKeyResult

# Interface: VerifyApiKeyResult

Defined in: [apikey.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/apikey.ts#L90)

## Properties

### key?

> `optional` **key?**: [`VerifiedKey`](VerifiedKey.md)

Defined in: [apikey.ts:96](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/apikey.ts#L96)

***

### ok

> **ok**: `boolean`

Defined in: [apikey.ts:91](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/apikey.ts#L91)

***

### principal?

> `optional` **principal?**: [`Principal`](Principal.md)

Defined in: [apikey.ts:95](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/apikey.ts#L95)

the `{ scopes }` Principal — the SAME shape principalFromSession returns, so enforceAccess works identically.

***

### reason?

> `optional` **reason?**: [`VerifyReason`](../type-aliases/VerifyReason.md)

Defined in: [apikey.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/apikey.ts#L93)

why verification failed (absent on success).
