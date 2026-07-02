[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / webhooksService

# Variable: webhooksService

> `const` **webhooksService**: `object`

Defined in: [service.ts:278](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L278)

## Type Declaration

### deps

> `readonly` **deps**: \[`"@suluk/payments"`\]

### env

> `readonly` **env**: \[\{ `hint`: `"verifies inbound Stripe events (POST /api/webhooks/stripe)"`; `name`: `"STRIPE_WEBHOOK_SECRET"`; `required`: `true`; `secret`: `true`; \}\]

### id

> `readonly` **id**: `"webhooks"` = `"webhooks"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/webhooks"` = `"./routes/webhooks"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/webhooks"` = `"/api/webhooks"`

#### mount.symbol

> `readonly` **symbol**: `"webhooksRoutes"` = `"webhooksRoutes"`

### provision

> `readonly` **provision**: `object`

#### provision.from

> `readonly` **from**: `"./src/provision/webhooks"` = `"./src/provision/webhooks"`

#### provision.symbol

> `readonly` **symbol**: `"webhooksProvision"` = `"webhooksProvision"`
