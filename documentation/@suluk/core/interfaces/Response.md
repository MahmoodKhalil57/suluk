[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / Response

# Interface: Response

Defined in: [types.ts:462](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L462)

Named in its containing map. Precedence: request > pathResponses > apiResponses (C012 #17b).

## Properties

### contentSchema?

> `optional` **contentSchema?**: [`SchemaOrRef`](../type-aliases/SchemaOrRef.md)

Defined in: [types.ts:466](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L466)

***

### contentType?

> `optional` **contentType?**: `string` \| `string`[]

Defined in: [types.ts:465](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L465)

***

### description?

> `optional` **description?**: `string`

Defined in: [types.ts:467](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L467)

***

### status

> **status**: `string` \| `number`

Defined in: [types.ts:464](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L464)

HTTP status ("200"/200), a wildcard ("5XX"), or "default".
