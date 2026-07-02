[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / mcpService

# Variable: mcpService

> `const` **mcpService**: `object`

Defined in: [service.ts:255](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/service.ts#L255)

## Type Declaration

### compose

> `readonly` **compose**: `object`

#### compose.exposes

> `readonly` **exposes**: `object`

#### compose.exposes.apiDocument

> `readonly` **apiDocument**: `object`

#### compose.exposes.apiDocument.hookOptKey

> `readonly` **hookOptKey**: `"apiDocument"` = `"apiDocument"`

#### compose.exposes.apiDocument.kind

> `readonly` **kind**: `"port"` = `"port"`

#### compose.exposes.apiDocument.render

> `readonly` **render**: (`e`) => `string`

##### Parameters

###### e

`string`[]

##### Returns

`string`

#### compose.exposes.mcpAuthInstance

> `readonly` **mcpAuthInstance**: `object`

#### compose.exposes.mcpAuthInstance.hookOptKey

> `readonly` **hookOptKey**: `"mcpAuthInstance"` = `"mcpAuthInstance"`

#### compose.exposes.mcpAuthInstance.kind

> `readonly` **kind**: `"port"` = `"port"`

#### compose.exposes.mcpAuthInstance.render

> `readonly` **render**: (`e`) => `string`

##### Parameters

###### e

`string`[]

##### Returns

`string`

### contract

> `readonly` **contract**: `object`

#### contract.from

> `readonly` **from**: `"./contract/mcp"` = `"./contract/mcp"`

#### contract.symbol

> `readonly` **symbol**: `"mcpOps"` = `"mcpOps"`

### deps

> `readonly` **deps**: \[`"@suluk/mcp"`, `"@suluk/better-auth"`, `"better-auth"`\]

### id

> `readonly` **id**: `"mcp"` = `"mcp"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/mcp"` = `"./routes/mcp"`

#### mount.kind

> `readonly` **kind**: `"middleware"` = `"middleware"`

#### mount.symbol

> `readonly` **symbol**: `"mountMcp"` = `"mountMcp"`

### provision

> `readonly` **provision**: `object`

#### provision.from

> `readonly` **from**: `"./src/provision/mcp"` = `"./src/provision/mcp"`

#### provision.symbol

> `readonly` **symbol**: `"mcpProvision"` = `"mcpProvision"`

### requires

> `readonly` **requires**: \[`"contract"`, `"auth"`\]
