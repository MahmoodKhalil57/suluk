[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / RpcContext

# Interface: RpcContext

Defined in: [protocol.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/mcp/src/protocol.ts#L17)

## Properties

### exec

> **exec**: [`ToolExec`](../type-aliases/ToolExec.md)

Defined in: [protocol.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/mcp/src/protocol.ts#L20)

***

### info

> **info**: `object`

Defined in: [protocol.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/mcp/src/protocol.ts#L19)

#### name

> **name**: `string`

#### version

> **version**: `string`

***

### instructions?

> `optional` **instructions?**: `string`

Defined in: [protocol.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/mcp/src/protocol.ts#L24)

Optional free-text usage guidance surfaced to the model on `initialize`.

***

### protocolVersion?

> `optional` **protocolVersion?**: `string`

Defined in: [protocol.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/mcp/src/protocol.ts#L22)

Server's preferred protocol version (echoed back only if the client didn't pin a supported one).

***

### resident?

> `optional` **resident?**: `Set`\<`string`\>

Defined in: [protocol.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/mcp/src/protocol.ts#L32)

TIER-TRIM (C027 tier-trim serving) — the names of the RESIDENT tools. When set, `tools/list` serves only those
plus a synthetic `discover_tools` meta-tool; the COLD-TAIL (every other tool) is withheld from the default
surface and revealed on demand when the model calls `discover_tools`. `tools/call` still executes ANY tool by
name (cold-tail tools are servable, just not advertised up front) — so the context reduction is real, lossless,
and self-healing. Absent ⇒ the full surface is served (no trim).

***

### tools

> **tools**: [`McpTool`](McpTool.md)[]

Defined in: [protocol.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/mcp/src/protocol.ts#L18)
