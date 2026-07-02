[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / cloudflareD1

# Function: cloudflareD1()

> **cloudflareD1**(`cf`): [`Broker`](../interfaces/Broker.md)

Defined in: [provision/src/brokers/cloudflare.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/brokers/cloudflare.ts#L25)

D1 database. Provision is create-or-get; when `params.migrations` (a `Migration[]`) is present they're applied through
 the @suluk/cloudflare ledger (each runs at most once). Output: `database_id`.

## Parameters

### cf

[`CloudflareClient`](../../cloudflare/classes/CloudflareClient.md)

## Returns

[`Broker`](../interfaces/Broker.md)
