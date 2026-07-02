[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / billingService

# Variable: billingService

> `const` **billingService**: `object`

Defined in: [service.ts:289](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L289)

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

> `readonly` **from**: `"./contract/billing"` = `"./contract/billing"`

#### contract.symbol

> `readonly` **symbol**: `"billingOps"` = `"billingOps"`

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
