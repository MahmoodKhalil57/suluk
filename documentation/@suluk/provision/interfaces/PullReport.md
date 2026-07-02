[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / PullReport

# Interface: PullReport

Defined in: [provision/src/pull.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/provision/src/pull.ts#L23)

## Properties

### clean

> **clean**: `boolean`

Defined in: [provision/src/pull.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/provision/src/pull.ts#L30)

nothing missing or drifted (unknowns don't count — we couldn't verify them).

***

### drifted

> **drifted**: `string`[]

Defined in: [provision/src/pull.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/provision/src/pull.ts#L28)

journaled refs whose live outputs differ from the journal.

***

### entries

> **entries**: [`PullEntry`](PullEntry.md)[]

Defined in: [provision/src/pull.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/provision/src/pull.ts#L24)

***

### missing

> **missing**: `string`[]

Defined in: [provision/src/pull.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/provision/src/pull.ts#L26)

journaled refs whose live resource is GONE (deleted outside the config) — the next `apply` re-creates them.
