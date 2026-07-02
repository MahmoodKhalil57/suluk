[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / billingService

# Variable: billingService

> `const` **billingService**: `object`

Defined in: [service.ts:251](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L251)

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
