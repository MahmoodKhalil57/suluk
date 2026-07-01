[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / mcpService

# Variable: mcpService

> `const` **mcpService**: `object`

Defined in: [service.ts:213](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/service.ts#L213)

## Type Declaration

### deps

> `readonly` **deps**: \[`"@suluk/mcp"`, `"better-auth"`\]

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
