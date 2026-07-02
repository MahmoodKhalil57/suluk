[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / creditsService

# Variable: creditsService

> `const` **creditsService**: `object`

Defined in: [service.ts:223](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/platform/src/service.ts#L223)

## Type Declaration

### compose

> `readonly` **compose**: `object`

#### compose.offers

> `readonly` **offers**: `object`

#### compose.offers.grantOnSignup

> `readonly` **grantOnSignup**: `object`

#### compose.offers.grantOnSignup.build

> `readonly` **build**: (`__namedParameters`) => `string`

##### Parameters

###### \_\_namedParameters

###### with

`Record`\<`string`, `unknown`\>

##### Returns

`string`

#### compose.offers.grantOnSignup.from

> `readonly` **from**: `"./services/credits"` = `"./services/credits"`

#### compose.offers.grantOnSignup.imports

> `readonly` **imports**: \[\{ `from`: `"effect"`; `symbol`: `"Effect"`; \}, \{ `from`: `"./services/credits"`; `symbol`: `"Credits"`; \}, \{ `from`: `"./services/credits"`; `symbol`: `"CreditsLive"`; \}, \{ `from`: `"./app"`; `symbol`: `"DbLive"`; \}\]

#### compose.offers.grantOnSignup.kind

> `readonly` **kind**: `"capability"` = `"capability"`

#### compose.offers.grantOnSignup.symbol

> `readonly` **symbol**: `"Credits"` = `"Credits"`

### contract

> `readonly` **contract**: `object`

#### contract.from

> `readonly` **from**: `"./contract/credits"` = `"./contract/credits"`

#### contract.symbol

> `readonly` **symbol**: `"creditsOps"` = `"creditsOps"`

### deps

> `readonly` **deps**: \[`"@suluk/credits"`\]

### id

> `readonly` **id**: `"credits"` = `"credits"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/credits"` = `"./routes/credits"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/credits"` = `"/api/credits"`

#### mount.symbol

> `readonly` **symbol**: `"creditsRoutes"` = `"creditsRoutes"`

### provision

> `readonly` **provision**: `object`

#### provision.from

> `readonly` **from**: `"./src/provision/credits"` = `"./src/provision/credits"`

#### provision.symbol

> `readonly` **symbol**: `"creditsProvision"` = `"creditsProvision"`
