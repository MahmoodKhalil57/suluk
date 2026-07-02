[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / DevLoginOptions

# Interface: DevLoginOptions

Defined in: [dev-login.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/better-auth/src/dev-login.ts#L22)

## Properties

### armed

> **armed**: `boolean`

Defined in: [dev-login.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/better-auth/src/dev-login.ts#L24)

FAIL-CLOSED gate — MUST be `true` to arm the endpoint. The registry passes its dev-mock condition; prod passes false.

***

### auth

> **auth**: [`DevLoginAuthLike`](DevLoginAuthLike.md)

Defined in: [dev-login.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/better-auth/src/dev-login.ts#L26)

the Better Auth instance (its `api.signUpEmail`/`signInEmail`).

***

### devPassword?

> `optional` **devPassword?**: `string`

Defined in: [dev-login.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/better-auth/src/dev-login.ts#L30)

override the fixed internal dev password (dev only; never surfaced).

***

### request

> **request**: `Request`

Defined in: [dev-login.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/better-auth/src/dev-login.ts#L28)

the incoming request — a JSON body `{ email }`.
