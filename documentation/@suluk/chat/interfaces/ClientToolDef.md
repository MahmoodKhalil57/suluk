[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / ClientToolDef

# Interface: ClientToolDef

Defined in: [chat/src/loop.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/chat/src/loop.ts#L14)

A browser-executed tool: the model can call it, but the WORKER never runs it — it streams a `client_tool` event
 to the widget, which executes the action (cart, theme, navigation, …) locally. Defs only (no handler) reach the
 server. Reads should come from the per-turn client-state snapshot, not these (which return only a generic ack).

## Properties

### description

> **description**: `string`

Defined in: [chat/src/loop.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/chat/src/loop.ts#L14)

***

### name

> **name**: `string`

Defined in: [chat/src/loop.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/chat/src/loop.ts#L14)

***

### parameters

> **parameters**: `object`

Defined in: [chat/src/loop.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/chat/src/loop.ts#L14)
