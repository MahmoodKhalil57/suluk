[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / routeToolDef

# Function: routeToolDef()

> **routeToolDef**(`doc`, `routeKey`, `operationRef`): [`RouteToolDef`](../interfaces/RouteToolDef.md)

Defined in: [agents/src/runtime-shared.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/runtime-shared.ts#L76)

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
