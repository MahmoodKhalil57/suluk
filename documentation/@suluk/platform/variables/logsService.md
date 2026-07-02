[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / logsService

# Variable: logsService

> `const` **logsService**: `object`

Defined in: [service.ts:350](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/service.ts#L350)

## Type Declaration

### compose

> `readonly` **compose**: `object`

#### compose.offers

> `readonly` **offers**: `object`

#### compose.offers.eraseStep

> `readonly` **eraseStep**: [`Capability`](../interfaces/Capability.md)\<`unknown`\>

### contract

> `readonly` **contract**: `object`

#### contract.from

> `readonly` **from**: `"./contract/logs"` = `"./contract/logs"`

#### contract.symbol

> `readonly` **symbol**: `"logsOps"` = `"logsOps"`

### id

> `readonly` **id**: `"logs"` = `"logs"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/logs"` = `"./routes/logs"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/logs"` = `"/api/logs"`

#### mount.symbol

> `readonly` **symbol**: `"logsRoutes"` = `"logsRoutes"`

### provision

> `readonly` **provision**: `object`

#### provision.from

> `readonly` **from**: `"./src/provision/logs"` = `"./src/provision/logs"`

#### provision.symbol

> `readonly` **symbol**: `"logsProvision"` = `"logsProvision"`
