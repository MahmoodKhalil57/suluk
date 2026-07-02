[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / eachOperation

# Function: eachOperation()

> **eachOperation**(`doc`): `object`[]

Defined in: [contract.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cost/src/contract.ts#L29)

Every named operation in the document — path requests AND C018 webhooks (which are Requests carrying facets) —
as {path, name, req}. Background-event cost lives on a webhook op, so every cost reader walks this, not just paths.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

`object`[]
