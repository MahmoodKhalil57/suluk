[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / discover

# Function: discover()

> **discover**(`state`, `brokers`): `Promise`\<[`DiscoveredInstance`](../interfaces/DiscoveredInstance.md)[]\>

Defined in: [provision/src/pull.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/provision/src/pull.ts#L82)

Discover live instances (via `broker.list`) that AREN'T in the journal — untracked resources to adopt (`pull
 --discover`). Skips services whose broker has no `list`.

## Parameters

### state

[`InstanceState`](../interfaces/InstanceState.md)[]

### brokers

`Record`\<`string`, [`Broker`](../interfaces/Broker.md)\>

## Returns

`Promise`\<[`DiscoveredInstance`](../interfaces/DiscoveredInstance.md)[]\>
