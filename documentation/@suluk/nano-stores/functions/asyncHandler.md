[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / asyncHandler

# Function: asyncHandler()

> **asyncHandler**\<`E`\>(`el`, `handler`, `opts?`): (`e`) => `Promise`\<`void`\>

Defined in: [tooling/ts/packages/nano-stores/src/async-button.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/async-button.ts#L24)

Wrap an async (or sync) handler with auto-disable + aria-busy + optional pending label + re-entry guard. Returns
 the wrapped handler — attach it yourself (composes with addEventListener / onClick).

## Type Parameters

### E

`E` = `unknown`

## Parameters

### el

`ElementLike`

### handler

(`e`) => `unknown`

### opts?

[`AsyncBindOptions`](../interfaces/AsyncBindOptions.md) = `{}`

## Returns

(`e`) => `Promise`\<`void`\>
