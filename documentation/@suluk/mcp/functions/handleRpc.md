[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / handleRpc

# Function: handleRpc()

> **handleRpc**(`msg`, `ctx`): `Promise`\<[`RpcResponse`](../interfaces/RpcResponse.md) \| `null`\>

Defined in: [protocol.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/mcp/src/protocol.ts#L54)

Dispatch one JSON-RPC message. Returns `null` ONLY for a notification — a message with no `id` MEMBER; the caller
 then emits no body. Anything carrying an `id` (even the discouraged `id: null`) always gets a correlated response.

## Parameters

### msg

[`RpcRequest`](../interfaces/RpcRequest.md)

### ctx

[`RpcContext`](../interfaces/RpcContext.md)

## Returns

`Promise`\<[`RpcResponse`](../interfaces/RpcResponse.md) \| `null`\>
