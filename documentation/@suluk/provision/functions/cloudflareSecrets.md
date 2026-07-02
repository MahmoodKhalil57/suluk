[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / cloudflareSecrets

# Function: cloudflareSecrets()

> **cloudflareSecrets**(`cf`): [`Broker`](../interfaces/Broker.md)

Defined in: [provision/src/brokers/cloudflare.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/brokers/cloudflare.ts#L122)

Worker secrets — the runtime-secret SINK as a broker (this is `sync-secrets.ts`). `params.script` is the Worker name;
 `params.secrets` is a `Record<string,string>` of secret name → value (resolved from upstream `@ref.key` bindings).
 Provision is an idempotent `wrangler secret put` for the whole set. Output: `secrets_set` (the names pushed).

## Parameters

### cf

[`CloudflareClient`](../../cloudflare/classes/CloudflareClient.md)

## Returns

[`Broker`](../interfaces/Broker.md)
