[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / Callback

# Type Alias: Callback

> **Callback** = `Record`\<`string`, [`PathItem`](../interfaces/PathItem.md)\>

Defined in: [types.ts:474](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/core/src/types.ts#L474)

A runtime-expression-keyed map of pathItem-shaped definitions (§14, C018).
The enclosing `Request.callbacks` is name-keyed, so `callbacks[name][expression]` is a [PathItem](../interfaces/PathItem.md).
