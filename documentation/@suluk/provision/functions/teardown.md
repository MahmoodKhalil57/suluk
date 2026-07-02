[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / teardown

# Function: teardown()

> **teardown**(`opts`): `Promise`\<[`TeardownResult`](../interfaces/TeardownResult.md)\>

Defined in: [provision/src/teardown.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/teardown.ts#L32)

Deprovision the whole journal, consumers-first, honouring `protected`. Destructive — gate it behind confirmation.

## Parameters

### opts

[`TeardownOptions`](../interfaces/TeardownOptions.md)

## Returns

`Promise`\<[`TeardownResult`](../interfaces/TeardownResult.md)\>
