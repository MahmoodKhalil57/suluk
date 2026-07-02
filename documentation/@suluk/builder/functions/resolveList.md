[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / resolveList

# Function: resolveList()

> **resolveList**(`spec`, `selection`): `string`[]

Defined in: [resolve.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/resolve.ts#L34)

The effective ordered selection for a `list` param. The default is the spec default (or all options).
A consumer selection is applied only as far as the controls allow:
  include → may add options not in the default ; hide → may drop ; reorder → may change order ;
  repeat  → may list an option more than once.
Returns the resolved ordered list (catalog keys).

## Parameters

### spec

#### controls

[`ListControl`](../type-aliases/ListControl.md)[]

Which manipulations the consumer is allowed (the narrowing on a list).

#### default?

`string`[]

Default ordered selection.

#### options

`string`[]

Catalog keys the consumer may pick from.

#### type

`"list"`

### selection

`string`[] \| `undefined`

## Returns

`string`[]
