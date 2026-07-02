[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / routeToolDef

# Function: routeToolDef()

> **routeToolDef**(`doc`, `routeKey`, `operationRef`): [`RouteToolDef`](../interfaces/RouteToolDef.md)

Defined in: [agents/src/runtime-shared.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/runtime-shared.ts#L76)

Derive a route's tool-def from the contract (name + description + input schema + approval gate + paid-tool price).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### routeKey

`string`

### operationRef

`string`

## Returns

[`RouteToolDef`](../interfaces/RouteToolDef.md)
