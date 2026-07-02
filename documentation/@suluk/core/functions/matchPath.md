[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / matchPath

# Function: matchPath()

> **matchPath**(`c`, `urlPath`): `Record`\<`string`, `string`\> \| `null`

Defined in: [template.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/core/src/template.ts#L52)

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
