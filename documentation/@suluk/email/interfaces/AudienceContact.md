[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / AudienceContact

# Interface: AudienceContact

Defined in: [audience.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/audience.ts#L10)

Audience-sync (saastarter-parity Phase 3). The newsletter signup stores a subscriber (the MARKETING module's
`Newsletter` entity) AND mirrors it to the email provider's AUDIENCE/list (saastarter POSTs to Resend
`/audiences/{id}/contacts`, src/app/api/newsletter/route.ts:35-41). This is that mirror as a swappable binding:
a duck-typed `AudienceProvider` (consoleAudience for dev; a Workers-safe resendAudience over the REST API, no SDK)
+ a `syncNewsletter` reconciler that drives the audience from the `Newsletter` rows (subscribed → upsert,
unsubscribed → remove). Content the app SENDS to a provider — never a hosted list.

## Properties

### email

> **email**: `string`

Defined in: [audience.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/audience.ts#L11)

***

### firstName?

> `optional` **firstName?**: `string`

Defined in: [audience.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/audience.ts#L12)

***

### lastName?

> `optional` **lastName?**: `string`

Defined in: [audience.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/audience.ts#L13)

***

### unsubscribed?

> `optional` **unsubscribed?**: `boolean`

Defined in: [audience.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/audience.ts#L14)
