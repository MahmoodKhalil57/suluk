[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / inSubtree

# Function: inSubtree()

> **inSubtree**(`path`, `candidate`): `boolean`

Defined in: [packages/keys/src/path.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/keys/src/path.ts#L20)

TRUE when `candidate` is within `path`'s subtree: the node itself (exact) OR a descendant (a "/"-prefix). The JS twin
 of the SQL subtree predicate — the single rule for spend pooling, log visibility, and cascade.

## Parameters

### path

`string`

### candidate

`string`

## Returns

`boolean`
