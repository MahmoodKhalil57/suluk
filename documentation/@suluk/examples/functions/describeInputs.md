[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/examples](../README.md) / describeInputs

# Function: describeInputs()

> **describeInputs**(`schema`): [`FieldDescriptor`](../interfaces/FieldDescriptor.md)[]

Defined in: [index.ts:101](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/examples/src/index.ts#L101)

Describe the TOP-LEVEL fields of an object schema by origin — the surface a client / the @suluk/sdk generator uses to
know what it may freely fill (`fakerable`), what is wired from elsewhere (`source`), and what is server-computed.

## Parameters

### schema

[`JsonSchema`](../type-aliases/JsonSchema.md) \| `undefined`

## Returns

[`FieldDescriptor`](../interfaces/FieldDescriptor.md)[]
