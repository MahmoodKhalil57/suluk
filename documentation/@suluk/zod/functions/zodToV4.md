[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/zod](../README.md) / zodToV4

# Function: zodToV4()

> **zodToV4**(`schema`, `opts?`): [`ZodToV4Result`](../interfaces/ZodToV4Result.md)

Defined in: [to-v4.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/zod/src/to-v4.ts#L28)

Convert a Zod schema to a v4 Schema Object. `io` picks the input vs output projection for schemas with
defaults/transforms ("output" is the default — the shape after parsing).

## Parameters

### schema

`ZodType`

### opts?

#### io?

`"input"` \| `"output"`

## Returns

[`ZodToV4Result`](../interfaces/ZodToV4Result.md)
