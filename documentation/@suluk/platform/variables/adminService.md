[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / adminService

# Variable: adminService

> `const` **adminService**: `object`

Defined in: [service.ts:333](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L333)

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
