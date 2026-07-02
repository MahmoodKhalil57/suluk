[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / matchPath

# Function: matchPath()

> **matchPath**(`c`, `urlPath`): `Record`\<`string`, `string`\> \| `null`

Defined in: [template.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/template.ts#L52)

Reverse-parse: match a concrete URL path against the template. Returns captured path variables, or null
if no match. Split on '/' first, then percent-decode captures (RFC3986 §2.1). Deterministic / injective
within the profile (no operator can yield two interpretations).

## Parameters

### c

[`CompiledTemplate`](../interfaces/CompiledTemplate.md)

### urlPath

`string`

## Returns

`Record`\<`string`, `string`\> \| `null`
