[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / InstanceSpec

# Interface: InstanceSpec

Defined in: [provision/src/types.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/types.ts#L38)

A declared instance the platform WANTS (the desired state — one entry in provision.config).

## Properties

### bind?

> `optional` **bind?**: `Record`\<`string`, `string`\>

Defined in: [provision/src/types.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/types.ts#L52)

binding outputs → env var names: where this instance's credentials/ids LAND (the binding-chain sink). e.g.
 `{ database_id: "CLOUDFLARE_D1_ID" }`.

***

### name

> **name**: `string`

Defined in: [provision/src/types.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/types.ts#L46)

the provider-facing name, e.g. "toolfactory-db".

***

### params?

> `optional` **params?**: `Record`\<`string`, `unknown`\>

Defined in: [provision/src/types.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/types.ts#L49)

provision params (broker-specific). A string value of the form `@<ref>.<key>` is a BINDING REFERENCE, resolved at
 apply time from that producer instance's outputs — this is what wires the provisioning DAG.

***

### plan?

> `optional` **plan?**: `string`

Defined in: [provision/src/types.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/types.ts#L44)

the plan id; defaults to the offering's first plan.

***

### protected?

> `optional` **protected?**: `boolean`

Defined in: [provision/src/types.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/types.ts#L55)

guard a stateful resource (a database, a bucket) from destruction: `prune` + `teardown` SKIP it unless forced.
 The terraform `prevent_destroy` analog — the safety rail for the resources whose loss is unrecoverable.

***

### ref

> **ref**: `string`

Defined in: [provision/src/types.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/types.ts#L40)

a unique handle within the config, referenced by other instances' params (e.g. "db", "kv-sessions").

***

### service

> **service**: `string`

Defined in: [provision/src/types.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/types.ts#L42)

the broker id that provisions it (must match a catalog offering's id), e.g. "cloudflare-d1".
