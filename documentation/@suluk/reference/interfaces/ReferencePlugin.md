[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / ReferencePlugin

# Interface: ReferencePlugin

Defined in: [reference/src/index.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/reference/src/index.ts#L22)

## Properties

### name

> **name**: `string`

Defined in: [reference/src/index.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/reference/src/index.ts#L23)

***

### onNormalize?

> `optional` **onNormalize?**: (`ir`) => `void` \| [`RefDoc`](RefDoc.md)

Defined in: [reference/src/index.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/reference/src/index.ts#L24)

#### Parameters

##### ir

[`RefDoc`](RefDoc.md)

#### Returns

`void` \| [`RefDoc`](RefDoc.md)

***

### slots?

> `optional` **slots?**: `object`

Defined in: [reference/src/index.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/reference/src/index.ts#L25)

#### heroAfter?

> `optional` **heroAfter?**: (`ir`) => `string`

##### Parameters

###### ir

[`RefDoc`](RefDoc.md)

##### Returns

`string`

#### opCardAfter?

> `optional` **opCardAfter?**: (`op`) => `string`

##### Parameters

###### op

[`NormalizedOperation`](NormalizedOperation.md)

##### Returns

`string`
