[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / adminService

# Variable: adminService

> `const` **adminService**: `object`

Defined in: [service.ts:290](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L290)

## Type Declaration

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
