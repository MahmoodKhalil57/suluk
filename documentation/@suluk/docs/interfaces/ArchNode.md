[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/docs](../README.md) / ArchNode

# Interface: ArchNode

Defined in: [diagram.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/docs/src/diagram.ts#L39)

A package node enriched for the UML architecture diagram (name, public-export count, a sample of exports).

## Properties

### exports

> **exports**: `number`

Defined in: [diagram.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/docs/src/diagram.ts#L43)

Number of public symbols the barrel re-exports (the node's surface-area badge).

***

### id

> **id**: `string`

Defined in: [diagram.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/docs/src/diagram.ts#L40)

***

### name

> **name**: `string`

Defined in: [diagram.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/docs/src/diagram.ts#L41)

***

### topExports

> **topExports**: `string`[]

Defined in: [diagram.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/docs/src/diagram.ts#L45)

A small deterministic sample of exported symbol names (for the node's members compartment).
