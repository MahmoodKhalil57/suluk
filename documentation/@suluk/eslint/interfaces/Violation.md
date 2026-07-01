[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/eslint](../README.md) / Violation

# Interface: Violation

Defined in: [analyze.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/eslint/src/analyze.ts#L24)

## Properties

### data

> **data**: `object`

Defined in: [analyze.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/eslint/src/analyze.ts#L30)

Message interpolation data: tag (native), attr (handler), or token (frontmatter).

#### attr?

> `optional` **attr?**: `string`

#### tag?

> `optional` **tag?**: `string`

#### token?

> `optional` **token?**: `string`

***

### index

> **index**: `number`

Defined in: [analyze.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/eslint/src/analyze.ts#L27)

Char offset into the original source (for the ESLint wrapper's getLocFromIndex).

***

### length

> **length**: `number`

Defined in: [analyze.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/eslint/src/analyze.ts#L28)

***

### metric

> **metric**: [`Metric`](../type-aliases/Metric.md)

Defined in: [analyze.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/eslint/src/analyze.ts#L25)
