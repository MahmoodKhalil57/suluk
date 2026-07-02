[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/panel](../README.md) / PanelSection

# Interface: PanelSection

Defined in: [app.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/app.ts#L17)

A custom, non-CRUD page mounted at `${basePath}/s/<id>`, rendered inside the panel shell.

## Properties

### id

> **id**: `string`

Defined in: [app.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/app.ts#L18)

***

### label

> **label**: `string`

Defined in: [app.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/app.ts#L19)

***

### render

> **render**: (`c`) => `string` \| `Promise`\<`string`\>

Defined in: [app.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/app.ts#L23)

Inner HTML for the section body (may include <script>); receives the request context.

#### Parameters

##### c

`Context`

#### Returns

`string` \| `Promise`\<`string`\>

***

### summary?

> `optional` **summary?**: `string`

Defined in: [app.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/app.ts#L21)

short line shown on the home card (else "Open").
