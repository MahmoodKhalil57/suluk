[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / discover

# Function: discover()

> **discover**(`state`, `brokers`): `Promise`\<[`DiscoveredInstance`](../interfaces/DiscoveredInstance.md)[]\>

Defined in: [provision/src/pull.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/pull.ts#L82)

Discover live instances (via `broker.list`) that AREN'T in the journal — untracked resources to adopt (`pull
 --discover`). Skips services whose broker has no `list`.

## Parameters

### state

[`InstanceState`](../interfaces/InstanceState.md)[]

### brokers

`Record`\<`string`, [`Broker`](../interfaces/Broker.md)\>

## Returns

`Promise`\<[`DiscoveredInstance`](../interfaces/DiscoveredInstance.md)[]\>
