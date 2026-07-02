[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / previewLoginHandler

# Function: previewLoginHandler()

> **previewLoginHandler**(`req`, `env`, `opts`): `Promise`\<`Response`\>

Defined in: [preview.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/better-auth/src/preview.ts#L60)

Handle `GET /preview/login?role=…`. Fail-closed: 404 unless both locks pass; 403 for a role not in the
allow-list; else mint the seeded demo session and 302 to the app. Never throws on a hostile request.

## Parameters

### req

[`PreviewRequestLike`](../interfaces/PreviewRequestLike.md)

### env

[`PreviewEnvLike`](../interfaces/PreviewEnvLike.md)

### opts

[`PreviewLoginOptions`](../interfaces/PreviewLoginOptions.md)

## Returns

`Promise`\<`Response`\>
