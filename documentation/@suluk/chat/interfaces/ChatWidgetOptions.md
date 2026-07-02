[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / ChatWidgetOptions

# Interface: ChatWidgetOptions

Defined in: [chat/src/widget.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/widget.ts#L17)

## Properties

### endpoint?

> `optional` **endpoint?**: `string`

Defined in: [chat/src/widget.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/widget.ts#L19)

Where chatApp is mounted (default /chat).

***

### greeting?

> `optional` **greeting?**: `string`

Defined in: [chat/src/widget.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/widget.ts#L23)

First assistant line shown when the panel opens (overridden by GET {endpoint}/info if it returns a greeting).

***

### placeholder?

> `optional` **placeholder?**: `string`

Defined in: [chat/src/widget.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/widget.ts#L24)

***

### title?

> `optional` **title?**: `string`

Defined in: [chat/src/widget.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/widget.ts#L21)

Panel header + launcher aria-label.
