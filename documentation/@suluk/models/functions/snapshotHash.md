[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / snapshotHash

# Function: snapshotHash()

> **snapshotHash**(`rows`): `string`

Defined in: [normalize.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/models/src/normalize.ts#L73)

A content-addressed hash over the rows' load-bearing SELECTION inputs — facts AND intel tiers (a re-pick under a
different catalog must differ; reproducible pin; ties C027 contentHash).

## Parameters

### rows

[`ModelRecord`](../interfaces/ModelRecord.md)[]

## Returns

`string`
