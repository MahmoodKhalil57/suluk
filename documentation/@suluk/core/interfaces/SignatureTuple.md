[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SignatureTuple

# Interface: SignatureTuple

Defined in: [signature.ts:6](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/signature.ts#L6)

Canonical signature tuple (C019 §A.2). The ADA's identity of a request; the matcher/collision key.

## Properties

### body

> **body**: `string`

Defined in: [signature.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/signature.ts#L17)

Stable id of the request-body schema: its $ref, the "#inline" SENTINEL (inline shape stays OUT of the key — D1/§A.2), or "*".

***

### contentType

> **contentType**: `string`

Defined in: [signature.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/signature.ts#L13)

Canonical media type, or "*" if absent (does-not-participate).

***

### headers

> **headers**: `string`[]

Defined in: [signature.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/signature.ts#L15)

Participating header names (lowercased, sorted); "*" sentinel if none (best-effort, #108).

***

### method

> **method**: `string`

Defined in: [signature.ts:7](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/signature.ts#L7)

***

### path

> **path**: `string`

Defined in: [signature.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/signature.ts#L9)

Path shape: literals kept, variables erased to `{}` (keys on shape, not on var spelling).

***

### query

> **query**: `string`[]

Defined in: [signature.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/signature.ts#L11)

Sorted query key-set (order/repetition-insensitive).
