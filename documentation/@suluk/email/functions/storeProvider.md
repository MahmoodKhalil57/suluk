[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / storeProvider

# Function: storeProvider()

> **storeProvider**(`sink`): [`EmailProvider`](../interfaces/EmailProvider.md)

Defined in: [provider.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/email/src/provider.ts#L78)

DEV/mock provider — SAVES the message to a mailbox sink (sqlite/json) instead of sending. Inspectable, never touches
the network, needs no separate mail server. The mock-until-keyed default for local dev when no `RESEND_API_KEY` is set.

## Parameters

### sink

[`MailboxSink`](../interfaces/MailboxSink.md)

## Returns

[`EmailProvider`](../interfaces/EmailProvider.md)
