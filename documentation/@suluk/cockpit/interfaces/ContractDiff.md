[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / ContractDiff

# Interface: ContractDiff

Defined in: [cockpit/src/drift.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/drift.ts#L31)

## Properties

### identical

> **identical**: `boolean`

Defined in: [cockpit/src/drift.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/drift.ts#L37)

true ⇒ local matches deployed exactly (no drift)

***

### operations

> **operations**: `object`

Defined in: [cockpit/src/drift.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/drift.ts#L32)

#### added

> **added**: [`OpRef`](OpRef.md)[]

#### changed

> **changed**: [`ChangedOp`](ChangedOp.md)[]

#### removed

> **removed**: [`OpRef`](OpRef.md)[]

***

### providers

> **providers**: `object`

Defined in: [cockpit/src/drift.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/drift.ts#L35)

provider-slot drift (x-suluk-providers) — e.g. local binds payments→paddle, deployed still →stripe

#### added

> **added**: [`ProviderDelta`](ProviderDelta.md)[]

#### changed

> **changed**: [`ProviderChange`](ProviderChange.md)[]

#### removed

> **removed**: [`ProviderDelta`](ProviderDelta.md)[]

***

### schemas

> **schemas**: `object`

Defined in: [cockpit/src/drift.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/drift.ts#L33)

#### added

> **added**: `string`[]

#### changed

> **changed**: `string`[]

#### removed

> **removed**: `string`[]

***

### summary

> **summary**: `string`

Defined in: [cockpit/src/drift.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/drift.ts#L39)

one-line digest, e.g. "1+ 0- 2~ ops · 1+ 0- 0~ schemas" or "in sync"
