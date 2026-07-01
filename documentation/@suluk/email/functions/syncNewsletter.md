[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / syncNewsletter

# Function: syncNewsletter()

> **syncNewsletter**(`provider`, `audienceId`, `rows`): `Promise`\<[`SyncResult`](../interfaces/SyncResult.md)\>

Defined in: [audience.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/email/src/audience.ts#L103)

Reconcile the `Newsletter` rows to an email-provider audience: a `subscribed` row is upserted, an `unsubscribed`
row is removed. Drives the audience from your DB (the source of truth), so the two never drift. Returns the tally.

## Parameters

### provider

[`AudienceProvider`](../interfaces/AudienceProvider.md)

### audienceId

`string`

### rows

[`NewsletterRow`](../interfaces/NewsletterRow.md)[]

## Returns

`Promise`\<[`SyncResult`](../interfaces/SyncResult.md)\>
