[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / resolveRef

# Function: resolveRef()

> **resolveRef**(`doc`, `ref`): `unknown`

Defined in: [reference.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/reference.ts#L20)

Resolve a same-document OpenAPI reference "#/components/<type>/<name>" BY NAME (C019 §A.1, C009).
Each pointer token is a map KEY (O(1) by-name); MUST throw if a key is absent; NEVER falls back to
positional/order lookup. Returns the referenced target. (Cross-document imports — C013 #72 — are not
yet implemented; a bare "#/..." is always same-document.)

## Parameters

### doc

[`OpenAPIv4Document`](../interfaces/OpenAPIv4Document.md)

### ref

`string`

## Returns

`unknown`
