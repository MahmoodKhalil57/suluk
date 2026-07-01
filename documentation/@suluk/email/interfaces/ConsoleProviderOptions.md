[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / ConsoleProviderOptions

# Interface: ConsoleProviderOptions

Defined in: [provider.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/email/src/provider.ts#L43)

`@suluk/email` — the missing EmailProvider binding + a per-event/per-locale branded template set. The app RENDERS
a message (pure, branded, localized via @suluk/i18n) and SENDS it through a swappable provider (consoleProvider in
dev; a Workers-safe resendProvider in prod). Never a hosted mailer — the provider is a thin binding (the
`@suluk/builder` `email` slot impl). CANDIDATE tooling.

## Properties

### log?

> `optional` **log?**: (`line`, `message`) => `void`

Defined in: [provider.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/email/src/provider.ts#L45)

sink (default console.log) — receives a one-line summary, never sends.

#### Parameters

##### line

`string`

##### message

[`EmailMessage`](EmailMessage.md)

#### Returns

`void`
