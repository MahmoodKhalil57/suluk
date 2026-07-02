[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / GateDecision

# Interface: GateDecision

Defined in: [tooling/ts/packages/hono/src/access.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/access.ts#L43)

A gate decision: may the op run, scope the query to the owner, and — when denied — the honest status.

## Properties

### ok

> **ok**: `boolean`

Defined in: [tooling/ts/packages/hono/src/access.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/access.ts#L43)

***

### scopeOwner

> **scopeOwner**: `boolean`

Defined in: [tooling/ts/packages/hono/src/access.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/access.ts#L43)

***

### status?

> `optional` **status?**: `401` \| `403`

Defined in: [tooling/ts/packages/hono/src/access.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/access.ts#L43)
