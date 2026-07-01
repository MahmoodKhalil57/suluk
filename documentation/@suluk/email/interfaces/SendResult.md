[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / SendResult

# Interface: SendResult

Defined in: [provider.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/email/src/provider.ts#L27)

`@suluk/email` — the missing EmailProvider binding + a per-event/per-locale branded template set. The app RENDERS
a message (pure, branded, localized via @suluk/i18n) and SENDS it through a swappable provider (consoleProvider in
dev; a Workers-safe resendProvider in prod). Never a hosted mailer — the provider is a thin binding (the
`@suluk/builder` `email` slot impl). CANDIDATE tooling.

## Properties

### costMicroUsd?

> `optional` **costMicroUsd?**: `number`

Defined in: [provider.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/email/src/provider.ts#L33)

the third-party send cost in µ$, for @suluk/cost metering (advisory).

***

### error?

> `optional` **error?**: `string`

Defined in: [provider.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/email/src/provider.ts#L31)

***

### id?

> `optional` **id?**: `string`

Defined in: [provider.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/email/src/provider.ts#L30)

the provider's message id, when sent.

***

### ok

> **ok**: `boolean`

Defined in: [provider.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/email/src/provider.ts#L28)
