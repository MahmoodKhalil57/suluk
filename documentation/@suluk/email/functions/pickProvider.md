[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / pickProvider

# Function: pickProvider()

> **pickProvider**(`opts`): [`EmailProvider`](../interfaces/EmailProvider.md)

Defined in: [provider.ts:140](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/email/src/provider.ts#L140)

Pick the provider the way saastarter's `isLocal` switch does: prod (a key + a from) ⇒ resend. In DEV (or no key) ⇒ a
mailbox [storeProvider](storeProvider.md) when a `sink` is supplied (the mock-until-keyed local default — saves + inspectable),
else the console provider (log-only).

## Parameters

### opts

#### apiKey?

`string`

#### costMicroUsd?

`number`

#### dev

`boolean`

#### from?

`string`

#### sink?

[`MailboxSink`](../interfaces/MailboxSink.md)

## Returns

[`EmailProvider`](../interfaces/EmailProvider.md)
