[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / toShadcnRegistry

# Function: toShadcnRegistry()

> **toShadcnRegistry**(`app`, `opts?`): `ShadcnRegistry`

Defined in: [registry-shadcn.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/registry-shadcn.ts#L79)

Convert a BuiltApp into a shadcn registry: one "block" item per entity bundling its frontend components +
backend routes module + its v4 schema, plus one "page" item per generated page.

## Parameters

### app

[`BuiltApp`](../interfaces/BuiltApp.md)

### opts?

#### homepage?

`string`

#### name?

`string`

## Returns

`ShadcnRegistry`
