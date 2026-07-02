[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / t

# Function: t()

> **t**(`messages`, `key`, `params?`): `string`

Defined in: [messages.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/i18n/src/messages.ts#L15)

Interpolate `{token}` params into a message; an unknown key falls back to the key itself.
Ported verbatim from saastarter i18n.ts:195-207.

## Parameters

### messages

[`Catalog`](../type-aliases/Catalog.md)

### key

`string`

### params?

`Record`\<`string`, `string` \| `number`\>

## Returns

`string`
