[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / DurableBinding

# Interface: DurableBinding

Defined in: [secrets.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/secrets.ts#L45)

## Properties

### binding

> **binding**: `string`

Defined in: [secrets.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/secrets.ts#L48)

the binding name the Worker code reads (e.g. RATE_LIMIT).

***

### kind

> **kind**: `"kv"` \| `"do"` \| `"r2"` \| `"queue"`

Defined in: [secrets.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/secrets.ts#L46)

***

### reason

> **reason**: `string`

Defined in: [secrets.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/secrets.ts#L52)

why the contract needs it.

***

### resource

> **resource**: `string`

Defined in: [secrets.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/secrets.ts#L50)

the resource name to create.
