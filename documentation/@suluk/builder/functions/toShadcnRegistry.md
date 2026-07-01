[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / toShadcnRegistry

# Function: toShadcnRegistry()

> **toShadcnRegistry**(`app`, `opts?`): `ShadcnRegistry`

Defined in: [registry-shadcn.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/registry-shadcn.ts#L79)

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
