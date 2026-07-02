[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / syncNewsletter

# Function: syncNewsletter()

> **syncNewsletter**(`provider`, `audienceId`, `rows`): `Promise`\<[`SyncResult`](../interfaces/SyncResult.md)\>

Defined in: [audience.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/email/src/audience.ts#L103)

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
