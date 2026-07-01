[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / OnErrorOptions

# Interface: OnErrorOptions

Defined in: [tooling/ts/packages/hono/src/on-error.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/hono/src/on-error.ts#L11)

## Properties

### log?

> `optional` **log?**: (`message`, `context`) => `void`

Defined in: [tooling/ts/packages/hono/src/on-error.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/hono/src/on-error.ts#L13)

sink for server-only diagnostics (defaults to console.error). Receives (message, context).

#### Parameters

##### message

`string`

##### context

`unknown`

#### Returns

`void`
