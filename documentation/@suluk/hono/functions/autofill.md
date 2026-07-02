[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / autofill

# Function: autofill()

> **autofill**(`doc`): [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

Defined in: [tooling/ts/packages/hono/src/audit.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/hono/src/audit.ts#L60)

Fill obvious documentation gaps in-place-safe (returns a new doc): synthesize a summary from the
operation name + method/path, and a description for undescribed responses. Conservative — never
overwrites authored text. This is the "automatically document under-documented routes" lever.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)
