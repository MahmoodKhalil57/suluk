[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / formSpec

# Function: formSpec()

> **formSpec**(`schema`, `opts?`): [`FormSpec`](../interfaces/FormSpec.md)

Defined in: [spec.ts:178](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/shadcn/src/spec.ts#L178)

Build a [FormSpec](../interfaces/FormSpec.md) from an object Schema Object. Each property becomes one [FieldSpec](../interfaces/FieldSpec.md).
A non-object root (array/scalar/boolean/unresolved-ref) yields zero fields plus a warning — honest, not silent.

## Parameters

### schema

[`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)

### opts?

[`SpecOptions`](../interfaces/SpecOptions.md) = `{}`

## Returns

[`FormSpec`](../interfaces/FormSpec.md)
