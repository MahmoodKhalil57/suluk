[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / routeToolDef

# Function: routeToolDef()

> **routeToolDef**(`doc`, `routeKey`, `operationRef`): [`RouteToolDef`](../interfaces/RouteToolDef.md)

Defined in: [agents/src/runtime-shared.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/runtime-shared.ts#L76)

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
