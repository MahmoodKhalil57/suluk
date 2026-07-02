[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / t

# Function: t()

> **t**(`messages`, `key`, `params?`): `string`

Defined in: [messages.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/i18n/src/messages.ts#L15)

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
