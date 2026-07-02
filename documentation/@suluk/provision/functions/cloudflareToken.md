[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / cloudflareToken

# Function: cloudflareToken()

> **cloudflareToken**(`cf`): [`Broker`](../interfaces/Broker.md)

Defined in: [provision/src/brokers/cloudflare.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/brokers/cloudflare.ts#L103)

A scoped, least-privilege Cloudflare API token (this is `mint-service-tokens.ts`). `params.permissionGroups` is the
 permission-group id list; `params.resources` defaults to the whole account. The token VALUE is returned only at
 creation, so it rides out as the `token` binding on provision (the framework's noop on re-apply never re-mints).
 deprovision revokes it. The minting parent credential is the broker's own `CloudflareClient`.

## Parameters

### cf

[`CloudflareClient`](../../cloudflare/classes/CloudflareClient.md)

## Returns

[`Broker`](../interfaces/Broker.md)
