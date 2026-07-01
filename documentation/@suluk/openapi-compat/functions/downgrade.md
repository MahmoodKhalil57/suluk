[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/openapi-compat](../README.md) / downgrade

# Function: downgrade()

> **downgrade**(`doc`): [`DowngradeResult`](../interfaces/DowngradeResult.md)

Defined in: [downgrade.ts:283](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/compat/src/downgrade.ts#L283)

Project a v4 "Suluk" document to OpenAPI 3.1. Returns the 3.1 document plus diagnostics for everything
that could not be carried losslessly. Schema Objects are shared verbatim (identical dialect).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`DowngradeResult`](../interfaces/DowngradeResult.md)
