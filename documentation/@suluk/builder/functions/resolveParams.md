[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / resolveParams

# Function: resolveParams()

> **resolveParams**(`doc`, `variant`, `props`): `Record`\<`string`, `unknown`\>

Defined in: [resolve.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/resolve.ts#L9)

Effective param values: defaults, then a variant preset, then consumer props (only keys in `params`).

## Parameters

### doc

[`DslDocument`](../interfaces/DslDocument.md)

### variant

`string` \| `undefined`

### props

`Record`\<`string`, `unknown`\> \| `undefined`

## Returns

`Record`\<`string`, `unknown`\>
