[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / mergeAuth

# Function: mergeAuth()

> **mergeAuth**(`app`, `auth`, `extra?`): [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

Defined in: [ingest.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/better-auth/src/ingest.ts#L60)

Deep-merge auth paths + components (schemas + securitySchemes) into an app's v4 document.

## Parameters

### app

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### auth

`Partial`\<[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)\>

### extra?

#### securitySchemes?

`Record`\<`string`, [`SecurityScheme`](../../core/interfaces/SecurityScheme.md)\>

## Returns

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)
