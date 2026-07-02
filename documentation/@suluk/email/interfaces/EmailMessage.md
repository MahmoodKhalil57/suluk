[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / EmailMessage

# Interface: EmailMessage

Defined in: [provider.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/email/src/provider.ts#L20)

A sendable message — a RenderedEmail plus addressing. The input to a provider.

## Extends

- `RenderedEmail`

## Extended by

- [`StoredEmail`](StoredEmail.md)

## Properties

### from?

> `optional` **from?**: `string`

Defined in: [provider.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/email/src/provider.ts#L23)

override the provider's default From.

***

### html

> **html**: `string`

Defined in: [provider.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/email/src/provider.ts#L15)

#### Inherited from

`RenderedEmail.html`

***

### replyTo?

> `optional` **replyTo?**: `string`

Defined in: [provider.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/email/src/provider.ts#L24)

***

### subject

> **subject**: `string`

Defined in: [provider.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/email/src/provider.ts#L14)

#### Inherited from

`RenderedEmail.subject`

***

### text?

> `optional` **text?**: `string`

Defined in: [provider.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/email/src/provider.ts#L16)

#### Inherited from

`RenderedEmail.text`

***

### to

> **to**: `string` \| `string`[]

Defined in: [provider.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/email/src/provider.ts#L21)
