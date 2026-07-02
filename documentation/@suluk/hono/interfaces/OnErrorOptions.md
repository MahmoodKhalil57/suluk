[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / OnErrorOptions

# Interface: OnErrorOptions

Defined in: [tooling/ts/packages/hono/src/on-error.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/on-error.ts#L11)

## Properties

### log?

> `optional` **log?**: (`message`, `context`) => `void`

Defined in: [tooling/ts/packages/hono/src/on-error.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/on-error.ts#L13)

sink for server-only diagnostics (defaults to console.error). Receives (message, context).

#### Parameters

##### message

`string`

##### context

`unknown`

#### Returns

`void`
