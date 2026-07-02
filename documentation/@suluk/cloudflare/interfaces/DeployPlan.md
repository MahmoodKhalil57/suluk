[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / DeployPlan

# Interface: DeployPlan

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L68)

## Properties

### assets?

> `optional` **assets?**: [`AssetFile`](AssetFile.md)[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L89)

static assets to serve (uploaded; bound as ASSETS by default).

***

### assetsBinding?

> `optional` **assetsBinding?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L90)

***

### assetsConfig?

> `optional` **assetsConfig?**: `Record`\<`string`, `unknown`\>

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:91](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L91)

***

### compatibilityDate

> **compatibilityDate**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L73)

***

### compatibilityFlags?

> `optional` **compatibilityFlags?**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:74](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L74)

***

### crons?

> `optional` **crons?**: `string`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L97)

cron triggers.

***

### d1?

> `optional` **d1?**: `object`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L76)

provision + bind a D1 database, applying each migration once (ledger-tracked, baseline-safe).

#### binding

> **binding**: `string`

#### databaseName

> **databaseName**: `string`

#### migrations?

> `optional` **migrations?**: [`Migration`](Migration.md)[]

***

### durableObjectMigration?

> `optional` **durableObjectMigration?**: `object`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L87)

the DO migration tags — `newTag` defaults to "v1"; pass `oldTag` on a redeploy that ADDS classes (optimistic concurrency).

#### newTag?

> `optional` **newTag?**: `string`

#### oldTag?

> `optional` **oldTag?**: `string`

***

### durableObjects?

> `optional` **durableObjects?**: [`DurableObjectBinding`](DurableObjectBinding.md)[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L82)

bind Durable Object agents (Cloudflare Agents SDK runtime) + create same-script classes via an inline migration.

***

### kv?

> `optional` **kv?**: `object`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L78)

provision + bind KV namespaces (binding → title).

#### binding

> **binding**: `string`

#### title

> **title**: `string`

***

### mainModule?

> `optional` **mainModule?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L72)

***

### module

> **module**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L71)

the bundled worker ES module.

***

### observability?

> `optional` **observability?**: `boolean`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L98)

***

### prevDurableObjects?

> `optional` **prevDurableObjects?**: [`DurableObjectBinding`](DurableObjectBinding.md)[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:85](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L85)

the previously-deployed DO class set. When given, the inline migration creates ONLY the classes added since (a true
 `old_tag`→`new_tag` delta); a removed class is logged (never auto-dropped), a backend-flip throws. Omit on first deploy.

***

### r2?

> `optional` **r2?**: `object`[]

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L80)

provision + bind R2 buckets (binding → bucketName).

#### binding

> **binding**: `string`

#### bucketName

> **bucketName**: `string`

***

### scriptName

> **scriptName**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L69)

***

### secrets?

> `optional` **secrets?**: `Record`\<`string`, `string` \| `undefined`\>

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:95](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L95)

encrypted secrets (empty values skipped).

***

### vars?

> `optional` **vars?**: `Record`\<`string`, `string`\>

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L93)

plain-text vars.
