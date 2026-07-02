[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / ApplyOptions

# Interface: ApplyOptions

Defined in: [provision/src/apply.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/apply.ts#L16)

## Properties

### brokers

> **brokers**: `Record`\<`string`, [`Broker`](Broker.md)\>

Defined in: [provision/src/apply.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/apply.ts#L18)

broker id → broker (the catalog of executors). A step whose `service` is absent here is an error.

***

### log?

> `optional` **log?**: (`msg`) => `void`

Defined in: [provision/src/apply.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/apply.ts#L27)

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### poll?

> `optional` **poll?**: [`PollOptions`](PollOptions.md)

Defined in: [provision/src/apply.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/apply.ts#L26)

async-poll tuning + seams (see [PollOptions](PollOptions.md)).

***

### prune?

> `optional` **prune?**: `boolean`

Defined in: [provision/src/apply.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/apply.ts#L24)

deprovision orphans (state − config). Defaults to the config's `pruneOrphans`.

***

### sink?

> `optional` **sink?**: [`BindingSink`](BindingSink.md)

Defined in: [provision/src/apply.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/apply.ts#L22)

where bound credentials land (the @suluk/env manifest in prod; memory in tests). Optional — omit to skip sinking.

***

### store

> **store**: [`StateStore`](StateStore.md)

Defined in: [provision/src/apply.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/apply.ts#L20)

the journal load/save (a JSON file in prod; memory in tests).
