[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / formSpec

# Function: formSpec()

> **formSpec**(`schema`, `opts?`): [`FormSpec`](../interfaces/FormSpec.md)

Defined in: [spec.ts:178](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/shadcn/src/spec.ts#L178)

Build a [FormSpec](../interfaces/FormSpec.md) from an object Schema Object. Each property becomes one [FieldSpec](../interfaces/FieldSpec.md).
A non-object root (array/scalar/boolean/unresolved-ref) yields zero fields plus a warning — honest, not silent.

## Parameters

### schema

[`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)

### opts?

[`SpecOptions`](../interfaces/SpecOptions.md) = `{}`

## Returns

[`FormSpec`](../interfaces/FormSpec.md)
