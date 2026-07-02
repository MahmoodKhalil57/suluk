[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / DurableBinding

# Interface: DurableBinding

Defined in: [secrets.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/deploy/src/secrets.ts#L45)

## Properties

### binding

> **binding**: `string`

Defined in: [secrets.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/deploy/src/secrets.ts#L48)

the binding name the Worker code reads (e.g. RATE_LIMIT).

***

### kind

> **kind**: `"kv"` \| `"do"` \| `"r2"` \| `"queue"`

Defined in: [secrets.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/deploy/src/secrets.ts#L46)

***

### reason

> **reason**: `string`

Defined in: [secrets.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/deploy/src/secrets.ts#L52)

why the contract needs it.

***

### resource

> **resource**: `string`

Defined in: [secrets.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/deploy/src/secrets.ts#L50)

the resource name to create.
