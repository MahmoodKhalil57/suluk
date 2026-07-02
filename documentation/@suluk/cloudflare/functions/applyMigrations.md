[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / applyMigrations

# Function: applyMigrations()

> **applyMigrations**(`cf`, `databaseId`, `migrations`, `now?`): `Promise`\<`string`[]\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:125](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/resources.ts#L125)

Apply D1 migrations with a LEDGER (`_suluk_migrations`) so each runs exactly once — the missing piece that makes a
redeploy safe. A migration not yet in the ledger is run and recorded; if it fails because the schema is ALREADY
present (a DB migrated by raw execute before tracking existed), that idempotency error is swallowed and the
migration is baselined (recorded), not fatal. Any other SQL error aborts. Returns the names newly recorded.

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### databaseId

`string`

### migrations

[`Migration`](../interfaces/Migration.md)[]

### now?

() => `number`

## Returns

`Promise`\<`string`[]\>
