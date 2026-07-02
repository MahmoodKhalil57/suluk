[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / InstanceState

# Interface: InstanceState

Defined in: [provision/src/types.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L59)

The live record of a provisioned instance (the journal `plan` diffs against — like drizzle's migration meta).

## Properties

### fingerprint

> **fingerprint**: `string`

Defined in: [provision/src/types.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L69)

a stable fingerprint of (name + plan + params), to detect drift → an `update` step.

***

### instanceId

> **instanceId**: `string`

Defined in: [provision/src/types.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L65)

the provider's instance id (e.g. the D1 uuid, the KV namespace id).

***

### name

> **name**: `string`

Defined in: [provision/src/types.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L63)

***

### outputs

> **outputs**: `Record`\<`string`, `string`\>

Defined in: [provision/src/types.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L67)

the binding outputs captured at provision/bind time (so downstream refs resolve without re-calling the provider).

***

### plan?

> `optional` **plan?**: `string`

Defined in: [provision/src/types.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L62)

***

### protected?

> `optional` **protected?**: `boolean`

Defined in: [provision/src/types.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L71)

carried from the spec so `teardown`/`prune` (which work off the journal) honour the destroy guard.

***

### provisionedAt

> **provisionedAt**: `number`

Defined in: [provision/src/types.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L72)

***

### ref

> **ref**: `string`

Defined in: [provision/src/types.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L60)

***

### service

> **service**: `string`

Defined in: [provision/src/types.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/provision/src/types.ts#L61)
