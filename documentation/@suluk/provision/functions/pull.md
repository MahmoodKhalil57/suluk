[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / pull

# Function: pull()

> **pull**(`state`, `brokers`): `Promise`\<[`PullReport`](../interfaces/PullReport.md)\>

Defined in: [provision/src/pull.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/pull.ts#L39)

Fetch each journaled instance's live state via its broker (OSB fetch) → an external-drift report. Read-only.

## Parameters

### state

[`InstanceState`](../interfaces/InstanceState.md)[]

### brokers

`Record`\<`string`, [`Broker`](../interfaces/Broker.md)\>

## Returns

`Promise`\<[`PullReport`](../interfaces/PullReport.md)\>
