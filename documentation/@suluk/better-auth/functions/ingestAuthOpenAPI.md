[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / ingestAuthOpenAPI

# Function: ingestAuthOpenAPI()

> **ingestAuthOpenAPI**(`schema30`, `opts?`): [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

Defined in: [ingest.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/better-auth/src/ingest.ts#L44)

Normalize + upgrade Better Auth's OpenAPI 3.0 schema to a v4 document (the auth surface).

## Parameters

### schema30

`Record`\<`string`, `unknown`\>

### opts?

[`IngestOptions`](../interfaces/IngestOptions.md) = `{}`

## Returns

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)
