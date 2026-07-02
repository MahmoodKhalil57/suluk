[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / snapshotHash

# Function: snapshotHash()

> **snapshotHash**(`rows`): `string`

Defined in: [normalize.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/models/src/normalize.ts#L73)

A content-addressed hash over the rows' load-bearing SELECTION inputs — facts AND intel tiers (a re-pick under a
different catalog must differ; reproducible pin; ties C027 contentHash).

## Parameters

### rows

[`ModelRecord`](../interfaces/ModelRecord.md)[]

## Returns

`string`
