[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / WireDecl

# Interface: WireDecl

Defined in: [manifest.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L53)

An inter-service composition EDGE (Phase 3). Declared here so a Phase-2 manifest's shape is forward-compatible; the
resolver ignores `wire` until the Phase-3 engine lands. `from`/`to` are `"<service>.<port|capability>"`.

## Properties

### from

> **from**: `string`

Defined in: [manifest.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L55)

***

### id?

> `optional` **id?**: `string`

Defined in: [manifest.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L54)

***

### optional?

> `optional` **optional?**: `boolean`

Defined in: [manifest.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L60)

PRUNE this edge (skip + warn) instead of throwing when an endpoint service isn't selected — so ONE full config is
 valid across every subset. A cross-cutting/optional link (erasure fan-in, contract↔auth) should set this.

***

### to

> **to**: `string`

Defined in: [manifest.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L56)

***

### with?

> `optional` **with?**: `Record`\<`string`, `unknown`\>

Defined in: [manifest.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/manifest.ts#L57)
