[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / storeProvider

# Function: storeProvider()

> **storeProvider**(`sink`): [`EmailProvider`](../interfaces/EmailProvider.md)

Defined in: [provider.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/email/src/provider.ts#L78)

DEV/mock provider — SAVES the message to a mailbox sink (sqlite/json) instead of sending. Inspectable, never touches
the network, needs no separate mail server. The mock-until-keyed default for local dev when no `RESEND_API_KEY` is set.

## Parameters

### sink

[`MailboxSink`](../interfaces/MailboxSink.md)

## Returns

[`EmailProvider`](../interfaces/EmailProvider.md)
