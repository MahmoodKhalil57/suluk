[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / ingestAuthOpenAPI

# Function: ingestAuthOpenAPI()

> **ingestAuthOpenAPI**(`schema30`, `opts?`): [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

Defined in: [ingest.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/ingest.ts#L44)

Normalize + upgrade Better Auth's OpenAPI 3.0 schema to a v4 document (the auth surface).

## Parameters

### schema30

`Record`\<`string`, `unknown`\>

### opts?

[`IngestOptions`](../interfaces/IngestOptions.md) = `{}`

## Returns

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)
