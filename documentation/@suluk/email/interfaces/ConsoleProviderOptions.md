[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / ConsoleProviderOptions

# Interface: ConsoleProviderOptions

Defined in: [provider.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/email/src/provider.ts#L43)

`@suluk/email` — the missing EmailProvider binding + a per-event/per-locale branded template set. The app RENDERS
a message (pure, branded, localized via @suluk/i18n) and SENDS it through a swappable provider (consoleProvider in
dev; a Workers-safe resendProvider in prod). Never a hosted mailer — the provider is a thin binding (the
`@suluk/builder` `email` slot impl). CANDIDATE tooling.

## Properties

### log?

> `optional` **log?**: (`line`, `message`) => `void`

Defined in: [provider.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/email/src/provider.ts#L45)

sink (default console.log) — receives a one-line summary, never sends.

#### Parameters

##### line

`string`

##### message

[`EmailMessage`](EmailMessage.md)

#### Returns

`void`
