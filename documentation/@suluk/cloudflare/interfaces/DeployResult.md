[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / DeployResult

# Interface: DeployResult

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:101](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L101)

## Properties

### accountId

> **accountId**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:102](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L102)

***

### assetsUploaded

> **assetsUploaded**: `number`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:110](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L110)

***

### crons

> **crons**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:112](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L112)

***

### d1?

> `optional` **d1?**: `object`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:104](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L104)

#### binding

> **binding**: `string`

#### id

> **id**: `string`

***

### durableObjects

> **durableObjects**: `object`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L107)

#### binding

> **binding**: `string`

#### className

> **className**: `string`

***

### durableObjectsRemoved

> **durableObjectsRemoved**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L109)

DO classes present in `prevDurableObjects` but gone from this deploy — orphaned (NOT dropped); a manual decision to delete.

***

### kv

> **kv**: `object`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:105](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L105)

#### binding

> **binding**: `string`

#### id

> **id**: `string`

***

### r2

> **r2**: `object`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:106](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L106)

#### binding

> **binding**: `string`

#### name

> **name**: `string`

***

### scriptName

> **scriptName**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L103)

***

### secretsSet

> **secretsSet**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:111](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/deploy.ts#L111)
