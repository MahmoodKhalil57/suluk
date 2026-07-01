[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / webhooksService

# Variable: webhooksService

> `const` **webhooksService**: `object`

Defined in: [service.ts:274](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L274)

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
