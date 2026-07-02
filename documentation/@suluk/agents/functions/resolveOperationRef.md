[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / resolveOperationRef

# Function: resolveOperationRef()

> **resolveOperationRef**(`doc`, `ref`): [`ResolvedOperation`](../interfaces/ResolvedOperation.md) \| `null`

Defined in: [agents/src/resolve.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/resolve.ts#L34)

Resolve a route's `operationRef` to an EXISTING operation. Supports the three operation loci:
 - `#/paths/<pathTemplate>/requests/<name>`  (a pathItem request — the common case)
 - `#/webhooks/<name>`                        (an incoming webhook operation)
 - `#/x-suluk-jobs/<name>`                    (a non-HTTP job, C025)
Returns null when the ref dangles (the resolve-lint failure — Conin's MCP-only `run_core_primitive`).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### ref

`string`

## Returns

[`ResolvedOperation`](../interfaces/ResolvedOperation.md) \| `null`
