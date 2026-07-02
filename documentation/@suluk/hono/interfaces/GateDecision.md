[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / GateDecision

# Interface: GateDecision

Defined in: [tooling/ts/packages/hono/src/access.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/hono/src/access.ts#L43)

A gate decision: may the op run, scope the query to the owner, and — when denied — the honest status.

## Properties

### ok

> **ok**: `boolean`

Defined in: [tooling/ts/packages/hono/src/access.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/hono/src/access.ts#L43)

***

### scopeOwner

> **scopeOwner**: `boolean`

Defined in: [tooling/ts/packages/hono/src/access.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/hono/src/access.ts#L43)

***

### status?

> `optional` **status?**: `401` \| `403`

Defined in: [tooling/ts/packages/hono/src/access.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/hono/src/access.ts#L43)
