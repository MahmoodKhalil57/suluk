[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / adminService

# Variable: adminService

> `const` **adminService**: `object`

Defined in: [service.ts:286](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L286)

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
