[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / TeardownOptions

# Interface: TeardownOptions

Defined in: [provision/src/teardown.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/teardown.ts#L11)

## Properties

### brokers

> **brokers**: `Record`\<`string`, [`Broker`](Broker.md)\>

Defined in: [provision/src/teardown.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/teardown.ts#L12)

***

### dryRun?

> `optional` **dryRun?**: `boolean`

Defined in: [provision/src/teardown.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/teardown.ts#L17)

preview only: compute the order + honour the rails, but call NO provider + don't save. The confirmation default.

***

### force?

> `optional` **force?**: `boolean`

Defined in: [provision/src/teardown.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/teardown.ts#L15)

override the `protected` rail — required to destroy a protected instance.

***

### log?

> `optional` **log?**: (`msg`) => `void`

Defined in: [provision/src/teardown.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/teardown.ts#L18)

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### poll?

> `optional` **poll?**: [`PollOptions`](PollOptions.md)

Defined in: [provision/src/teardown.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/teardown.ts#L19)

***

### store

> **store**: [`StateStore`](StateStore.md)

Defined in: [provision/src/teardown.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/teardown.ts#L13)
