[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / billingService

# Variable: billingService

> `const` **billingService**: `object`

Defined in: [service.ts:247](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L247)

## Type Declaration

### deps

> `readonly` **deps**: \[`"@suluk/billing"`, `"@suluk/payments"`, `"@suluk/credits"`\]

### env

> `readonly` **env**: \[\{ `hint`: `"your Stripe secret key"`; `name`: `"STRIPE_SECRET_KEY"`; `required`: `true`; `secret`: `true`; \}, \{ `hint`: `"returned by GET /api/billing/payment-config"`; `name`: `"STRIPE_PUBLISHABLE_KEY"`; \}\]

### id

> `readonly` **id**: `"billing"` = `"billing"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/billing"` = `"./routes/billing"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/billing"` = `"/api/billing"`

#### mount.symbol

> `readonly` **symbol**: `"billingRoutes"` = `"billingRoutes"`

### provision

> `readonly` **provision**: `object`

#### provision.from

> `readonly` **from**: `"./src/provision/billing"` = `"./src/provision/billing"`

#### provision.symbol

> `readonly` **symbol**: `"billingProvision"` = `"billingProvision"`
