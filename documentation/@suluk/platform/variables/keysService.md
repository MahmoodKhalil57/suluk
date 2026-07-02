[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / keysService

# Variable: keysService

> `const` **keysService**: `object`

Defined in: [service.ts:297](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/service.ts#L297)

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

> `readonly` **from**: `"./contract/keys"` = `"./contract/keys"`

#### contract.symbol

> `readonly` **symbol**: `"keysOps"` = `"keysOps"`

### deps

> `readonly` **deps**: \[`"@suluk/keys"`\]

### id

> `readonly` **id**: `"keys"` = `"keys"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/keys"` = `"./routes/keys"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/keys"` = `"/api/keys"`

#### mount.symbol

> `readonly` **symbol**: `"keysRoutes"` = `"keysRoutes"`

### provision

> `readonly` **provision**: `object`

#### provision.from

> `readonly` **from**: `"./src/provision/keys"` = `"./src/provision/keys"`

#### provision.symbol

> `readonly` **symbol**: `"keysProvision"` = `"keysProvision"`

### requires

> `readonly` **requires**: \[`"auth"`\]
