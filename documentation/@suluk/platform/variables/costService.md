[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / costService

# Variable: costService

> `const` **costService**: `object`

Defined in: [service.ts:315](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L315)

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
