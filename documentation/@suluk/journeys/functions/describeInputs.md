[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / describeInputs

# Function: describeInputs()

> **describeInputs**(`schema`): [`FieldDescriptor`](../interfaces/FieldDescriptor.md)[]

Defined in: [examples/src/index.ts:101](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/examples/src/index.ts#L101)

Describe the TOP-LEVEL fields of an object schema by origin — the surface a client / the @suluk/sdk generator uses to
know what it may freely fill (`fakerable`), what is wired from elsewhere (`source`), and what is server-computed.

## Parameters

### schema

[`JsonSchema`](../type-aliases/JsonSchema.md) \| `undefined`

## Returns

[`FieldDescriptor`](../interfaces/FieldDescriptor.md)[]
