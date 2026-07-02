[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / orderConfirmationEmail

# Function: orderConfirmationEmail()

> **orderConfirmationEmail**(`params`, `ctx`): `RenderedEmail`

Defined in: [templates.ts:131](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/email/src/templates.ts#L131)

Order confirmation — renders a line-item table + total (amounts formatted via Intl in the given locale), and an
 optional "Shipping to" block when the order ships a physical good. `shippingAddress` is one display line per array
 entry (e.g. ["Jane Doe", "12 Oak St", "Austin, TX 78701", "US"]); entries are HTML-escaped here defensively.

## Parameters

### params

#### currency

`string`

#### items

[`OrderLine`](../interfaces/OrderLine.md)[]

#### locale?

`string`

#### orderNumber

`string`

#### orderUrl?

`string`

#### shippingAddress?

`string`[]

#### totalCents

`number`

### ctx

[`TemplateContext`](../interfaces/TemplateContext.md)

## Returns

`RenderedEmail`
