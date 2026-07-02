[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / cloudflareWwwRedirect

# Function: cloudflareWwwRedirect()

> **cloudflareWwwRedirect**(`cf`): [`Broker`](../interfaces/Broker.md)

Defined in: [provision/src/brokers/cloudflare.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/brokers/cloudflare.ts#L68)

A www → apex 301 redirect (C058) on the zone of `params.apexHost` — provisions the `www` canonicalization the URL
 single-source assumes. Idempotent (dedup by rule description). `deprovision` removes just the suluk rule. Zone-scoped:
 the broker's token needs Zone:Read + Dynamic-Redirect:Edit (NOT the account-scoped D1/KV tokens). Output: `zone_id`.

## Parameters

### cf

[`CloudflareClient`](../../cloudflare/classes/CloudflareClient.md)

## Returns

[`Broker`](../interfaces/Broker.md)
