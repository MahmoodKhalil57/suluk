[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / pollToDone

# Function: pollToDone()

> **pollToDone**(`broker`, `req`, `poll`, `log`): `Promise`\<`void`\>

Defined in: [provision/src/poll.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/provision/src/poll.ts#L17)

Poll an async operation to a terminal state. Throws on "failed" or after `timeoutMs`.

## Parameters

### broker

[`Broker`](../interfaces/Broker.md)

### req

#### instanceId?

`string`

#### name

`string`

#### operation

`string`

#### ref

`string`

### poll

[`PollOptions`](../interfaces/PollOptions.md)

### log

(`m`) => `void`

## Returns

`Promise`\<`void`\>
