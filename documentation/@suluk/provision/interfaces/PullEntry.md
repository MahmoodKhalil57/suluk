[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / PullEntry

# Interface: PullEntry

Defined in: [provision/src/pull.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/pull.ts#L12)

## Properties

### instanceId

> **instanceId**: `string`

Defined in: [provision/src/pull.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/pull.ts#L16)

***

### liveOutputs?

> `optional` **liveOutputs?**: `Record`\<`string`, `string`\>

Defined in: [provision/src/pull.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/pull.ts#L20)

***

### name

> **name**: `string`

Defined in: [provision/src/pull.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/pull.ts#L15)

***

### ref

> **ref**: `string`

Defined in: [provision/src/pull.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/pull.ts#L13)

***

### service

> **service**: `string`

Defined in: [provision/src/pull.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/pull.ts#L14)

***

### status

> **status**: [`PullStatus`](../type-aliases/PullStatus.md)

Defined in: [provision/src/pull.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/pull.ts#L19)

live = present + matches · missing = gone from the provider · drifted = present but outputs changed · unknown = the
 broker has no `fetch`, so we couldn't check.
