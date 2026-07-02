[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / mcpService

# Variable: mcpService

> `const` **mcpService**: `object`

Defined in: [service.ts:249](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L249)

## Type Declaration

### compose

> `readonly` **compose**: `object`

#### compose.exposes

> `readonly` **exposes**: `object`

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
