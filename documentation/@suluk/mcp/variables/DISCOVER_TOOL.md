[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / DISCOVER\_TOOL

# Variable: DISCOVER\_TOOL

> `const` **DISCOVER\_TOOL**: `object`

Defined in: [protocol.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/mcp/src/protocol.ts#L36)

The synthetic meta-tool that reveals the cold-tail. It is NEVER routed to `exec` — handled in `tools/call`.

## Type Declaration

### description

> `readonly` **description**: `string`

### inputSchema

> `readonly` **inputSchema**: `object`

#### inputSchema.properties

> `readonly` **properties**: `object`

#### inputSchema.properties.intent

> `readonly` **intent**: `object`

#### inputSchema.properties.intent.description

> `readonly` **description**: `"what you are trying to do — filters the cold-tail tools (omit to list all)"` = `"what you are trying to do — filters the cold-tail tools (omit to list all)"`

#### inputSchema.properties.intent.type

> `readonly` **type**: `"string"` = `"string"`

#### inputSchema.type

> `readonly` **type**: `"object"` = `"object"`

### name

> `readonly` **name**: `"discover_tools"` = `"discover_tools"`
