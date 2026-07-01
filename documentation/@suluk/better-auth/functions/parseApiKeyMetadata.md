[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / parseApiKeyMetadata

# Function: parseApiKeyMetadata()

> **parseApiKeyMetadata**(`raw`): [`ApiKeyMetadata`](../interfaces/ApiKeyMetadata.md) \| `null`

Defined in: [apikey.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/better-auth/src/apikey.ts#L24)

Safely parse key metadata, handling Better Auth's potential DOUBLE-stringification of the JSON field.
Ported verbatim from saastarter metadata.ts:14-39 (the double-JSON.parse guard is load-bearing — without it a
double-stringified blob silently reads as a string, not the object).

## Parameters

### raw

`unknown`

## Returns

[`ApiKeyMetadata`](../interfaces/ApiKeyMetadata.md) \| `null`
