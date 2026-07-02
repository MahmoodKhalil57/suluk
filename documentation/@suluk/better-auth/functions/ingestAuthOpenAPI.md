[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / ingestAuthOpenAPI

# Function: ingestAuthOpenAPI()

> **ingestAuthOpenAPI**(`schema30`, `opts?`): [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

Defined in: [ingest.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/better-auth/src/ingest.ts#L44)

Normalize + upgrade Better Auth's OpenAPI 3.0 schema to a v4 document (the auth surface).

## Parameters

### schema30

`Record`\<`string`, `unknown`\>

### opts?

[`IngestOptions`](../interfaces/IngestOptions.md) = `{}`

## Returns

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)
