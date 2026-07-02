[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / AxisRule

# Interface: AxisRule

Defined in: [bucketing.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/models/src/bucketing.ts#L12)

## Properties

### boundaries

> **boundaries**: `object`

Defined in: [bucketing.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/models/src/bucketing.ts#L18)

score >= frontier ⇒ frontier; >= strong ⇒ strong; >= mid ⇒ mid; else basic.

#### frontier

> **frontier**: `number`

#### mid

> **mid**: `number`

#### strong

> **strong**: `number`

***

### metric

> **metric**: `string`

Defined in: [bucketing.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/models/src/bucketing.ts#L16)

what the score means (so a reviewer can reproduce the bucketing).

***

### source

> **source**: `string`

Defined in: [bucketing.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/models/src/bucketing.ts#L14)

the public leaderboard(s) this axis is bucketed from (cited in every cell's `source`).
