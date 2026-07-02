[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / webhooksService

# Variable: webhooksService

> `const` **webhooksService**: `object`

Defined in: [service.ts:320](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L320)

## Type Declaration

### contract

> `readonly` **contract**: `object`

#### contract.from

> `readonly` **from**: `"./contract/webhooks"` = `"./contract/webhooks"`

#### contract.symbol

> `readonly` **symbol**: `"webhooksOps"` = `"webhooksOps"`

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
