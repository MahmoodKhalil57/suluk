[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / generateStoresModule

# Function: generateStoresModule()

> **generateStoresModule**(`doc`, `opts?`): `string`

Defined in: [cockpit/src/codegen.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cockpit/src/codegen.ts#L40)

Generate the Nano Stores client wiring. @suluk/nano-stores is a runtime helper (createApiStores(routes)),
so the "codegen" is a thin, honest scaffold: it wires the user's RouteContracts to a typed store client and
lists, in comments, the exact stores the cockpit derived from the current document.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

#### baseUrl?

`string`

## Returns

`string`
