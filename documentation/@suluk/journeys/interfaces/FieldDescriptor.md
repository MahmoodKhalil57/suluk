[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / FieldDescriptor

# Interface: FieldDescriptor

Defined in: [examples/src/index.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/examples/src/index.ts#L67)

## Properties

### fakerable

> **fakerable**: `boolean`

Defined in: [examples/src/index.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/examples/src/index.ts#L75)

true IFF a client may freely synthesize/fill it (origin === "input").

***

### from?

> `optional` **from?**: `string`

Defined in: [examples/src/index.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/examples/src/index.ts#L71)

the raw `x-suluk-from` when it is a human note (string).

***

### name

> **name**: `string`

Defined in: [examples/src/index.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/examples/src/index.ts#L68)

***

### origin

> **origin**: [`FieldOrigin`](../type-aliases/FieldOrigin.md)

Defined in: [examples/src/index.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/examples/src/index.ts#L69)

***

### required

> **required**: `boolean`

Defined in: [examples/src/index.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/examples/src/index.ts#L76)

***

### source?

> `optional` **source?**: [`SourceRef`](SourceRef.md)

Defined in: [examples/src/index.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/examples/src/index.ts#L73)

the machine-wireable edge when `x-suluk-from` is structured `{ op, select? }`.
