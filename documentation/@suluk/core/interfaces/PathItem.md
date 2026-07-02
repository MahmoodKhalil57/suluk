[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / PathItem

# Interface: PathItem

Defined in: [types.ts:331](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L331)

A pathItem, keyed in `paths` by its uriTemplate. Each request *is* an operation (SPEC §1.3/1.4).

## Properties

### description?

> `optional` **description?**: `string`

Defined in: [types.ts:333](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L333)

***

### pathResponses?

> `optional` **pathResponses?**: `Record`\<`string`, [`Response`](Response.md)\>

Defined in: [types.ts:340](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L340)

Responses reusable across this pathItem's requests (§5).

***

### requests

> **requests**: `Record`\<`string`, [`Request`](Request.md)\>

Defined in: [types.ts:338](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L338)

The operations at this path, keyed by stable name (C009). At least one required.

***

### servers?

> `optional` **servers?**: [`Server`](Server.md)[]

Defined in: [types.ts:334](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L334)

***

### shared?

> `optional` **shared?**: [`Shared`](Shared.md)

Defined in: [types.ts:336](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L336)

Optional per-level inheritance wrapper (C012 #116).

***

### summary?

> `optional` **summary?**: `string`

Defined in: [types.ts:332](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L332)
