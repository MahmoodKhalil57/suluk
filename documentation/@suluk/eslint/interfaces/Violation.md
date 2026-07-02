[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/eslint](../README.md) / Violation

# Interface: Violation

Defined in: analyze.ts:24

## Properties

### data

> **data**: `object`

Defined in: analyze.ts:30

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

Defined in: analyze.ts:27

Char offset into the original source (for the ESLint wrapper's getLocFromIndex).

***

### length

> **length**: `number`

Defined in: analyze.ts:28

***

### metric

> **metric**: [`Metric`](../type-aliases/Metric.md)

Defined in: analyze.ts:25
