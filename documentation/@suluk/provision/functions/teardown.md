[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / teardown

# Function: teardown()

> **teardown**(`opts`): `Promise`\<[`TeardownResult`](../interfaces/TeardownResult.md)\>

Defined in: [provision/src/teardown.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/teardown.ts#L32)

Deprovision the whole journal, consumers-first, honouring `protected`. Destructive — gate it behind confirmation.

## Parameters

### opts

[`TeardownOptions`](../interfaces/TeardownOptions.md)

## Returns

`Promise`\<[`TeardownResult`](../interfaces/TeardownResult.md)\>
