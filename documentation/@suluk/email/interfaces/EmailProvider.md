[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / EmailProvider

# Interface: EmailProvider

Defined in: [provider.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/email/src/provider.ts#L37)

The swappable binding. An app picks one impl; the template set is provider-agnostic.

## Properties

### id

> `readonly` **id**: `string`

Defined in: [provider.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/email/src/provider.ts#L39)

a stable id (e.g. "resend", "console") — matches the @suluk/builder provider-slot impl id.

## Methods

### send()

> **send**(`message`): `Promise`\<[`SendResult`](SendResult.md)\>

Defined in: [provider.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/email/src/provider.ts#L40)

#### Parameters

##### message

[`EmailMessage`](EmailMessage.md)

#### Returns

`Promise`\<[`SendResult`](SendResult.md)\>
