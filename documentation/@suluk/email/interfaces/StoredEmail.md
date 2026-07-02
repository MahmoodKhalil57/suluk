[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / StoredEmail

# Interface: StoredEmail

Defined in: [provider.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/email/src/provider.ts#L62)

A stored (mocked) email — what a local mailbox sink persists INSTEAD of sending.

## Extends

- [`EmailMessage`](EmailMessage.md)

## Properties

### at

> **at**: `string`

Defined in: [provider.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/email/src/provider.ts#L64)

ISO timestamp the message was captured.

***

### from?

> `optional` **from?**: `string`

Defined in: [provider.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/email/src/provider.ts#L23)

override the provider's default From.

#### Inherited from

[`EmailMessage`](EmailMessage.md).[`from`](EmailMessage.md#from)

***

### html

> **html**: `string`

Defined in: [provider.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/email/src/provider.ts#L15)

#### Inherited from

[`EmailMessage`](EmailMessage.md).[`html`](EmailMessage.md#html)

***

### replyTo?

> `optional` **replyTo?**: `string`

Defined in: [provider.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/email/src/provider.ts#L24)

#### Inherited from

[`EmailMessage`](EmailMessage.md).[`replyTo`](EmailMessage.md#replyto)

***

### subject

> **subject**: `string`

Defined in: [provider.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/email/src/provider.ts#L14)

#### Inherited from

[`EmailMessage`](EmailMessage.md).[`subject`](EmailMessage.md#subject)

***

### text?

> `optional` **text?**: `string`

Defined in: [provider.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/email/src/provider.ts#L16)

#### Inherited from

[`EmailMessage`](EmailMessage.md).[`text`](EmailMessage.md#text)

***

### to

> **to**: `string` \| `string`[]

Defined in: [provider.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/email/src/provider.ts#L21)

#### Inherited from

[`EmailMessage`](EmailMessage.md).[`to`](EmailMessage.md#to)
