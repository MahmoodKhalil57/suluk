[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / costService

# Variable: costService

> `const` **costService**: `object`

Defined in: [service.ts:304](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/platform/src/service.ts#L304)

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

> `readonly` **from**: `"./contract/cost"` = `"./contract/cost"`

#### contract.symbol

> `readonly` **symbol**: `"costOps"` = `"costOps"`

### deps

> `readonly` **deps**: \[`"@suluk/cost"`\]

### id

> `readonly` **id**: `"cost"` = `"cost"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/cost"` = `"./routes/cost"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/cost"` = `"/api/cost"`

#### mount.symbol

> `readonly` **symbol**: `"costRoutes"` = `"costRoutes"`

### provision

> `readonly` **provision**: `object`

#### provision.from

> `readonly` **from**: `"./src/provision/cost"` = `"./src/provision/cost"`

#### provision.symbol

> `readonly` **symbol**: `"costProvision"` = `"costProvision"`
