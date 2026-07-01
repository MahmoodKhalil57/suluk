[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / MailboxSink

# Interface: MailboxSink

Defined in: [provider.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/email/src/provider.ts#L69)

A mailbox sink — where [storeProvider](../functions/storeProvider.md) SAVES instead of sending (a JSON file / sqlite in local dev). `list`
 powers a dev inbox view. Structurally typed so a bun-only file sink (e.g. `@suluk/cloudflare/local`) satisfies it.

## Methods

### list()?

> `optional` **list**(): `Promise`\<[`StoredEmail`](StoredEmail.md)[]\>

Defined in: [provider.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/email/src/provider.ts#L71)

#### Returns

`Promise`\<[`StoredEmail`](StoredEmail.md)[]\>

***

### save()

> **save**(`email`): `Promise`\<`void`\>

Defined in: [provider.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/email/src/provider.ts#L70)

#### Parameters

##### email

[`StoredEmail`](StoredEmail.md)

#### Returns

`Promise`\<`void`\>
