[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / resolveParams

# Function: resolveParams()

> **resolveParams**(`doc`, `variant`, `props`): `Record`\<`string`, `unknown`\>

Defined in: [resolve.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/resolve.ts#L9)

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
