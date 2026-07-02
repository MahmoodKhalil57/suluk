[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / adminService

# Variable: adminService

> `const` **adminService**: `object`

Defined in: [service.ts:349](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L349)

## Type Declaration

### contract

> `readonly` **contract**: `object`

#### contract.from

> `readonly` **from**: `"./contract/admin"` = `"./contract/admin"`

#### contract.symbol

> `readonly` **symbol**: `"adminOps"` = `"adminOps"`

### deps

> `readonly` **deps**: \[`"@suluk/credits"`\]

### env

> `readonly` **env**: \[\{ `hint`: `"comma/space-separated admin emails → the admin scope (secret-surfaced so they stay out of git plaintext)"`; `name`: `"SUPERADMIN_EMAILS"`; `secret`: `true`; \}\]

### id

> `readonly` **id**: `"admin"` = `"admin"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/admin"` = `"./routes/admin"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/admin"` = `"/api/admin"`

#### mount.symbol

> `readonly` **symbol**: `"adminRoutes"` = `"adminRoutes"`
