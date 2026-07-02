[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / StateStore

# Interface: StateStore

Defined in: [provision/src/types.ts:142](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/types.ts#L142)

The persisted provision journal (desired-vs-live diffing). The default store is a JSON file; a test passes memory.

## Methods

### load()

> **load**(): [`InstanceState`](InstanceState.md)[] \| `Promise`\<[`InstanceState`](InstanceState.md)[]\>

Defined in: [provision/src/types.ts:143](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/types.ts#L143)

#### Returns

[`InstanceState`](InstanceState.md)[] \| `Promise`\<[`InstanceState`](InstanceState.md)[]\>

***

### save()

> **save**(`state`): `void` \| `Promise`\<`void`\>

Defined in: [provision/src/types.ts:144](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/types.ts#L144)

#### Parameters

##### state

[`InstanceState`](InstanceState.md)[]

#### Returns

`void` \| `Promise`\<`void`\>
