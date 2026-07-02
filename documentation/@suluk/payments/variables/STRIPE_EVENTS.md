[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / STRIPE\_EVENTS

# Variable: STRIPE\_EVENTS

> `const` **STRIPE\_EVENTS**: `object`

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/stripe-webhook.ts#L87)

The common Stripe checkout/billing event types (for discoverability + typo-safe registration).

## Type Declaration

### chargeRefunded

> `readonly` **chargeRefunded**: `"charge.refunded"` = `"charge.refunded"`

### checkoutCompleted

> `readonly` **checkoutCompleted**: `"checkout.session.completed"` = `"checkout.session.completed"`

### checkoutExpired

> `readonly` **checkoutExpired**: `"checkout.session.expired"` = `"checkout.session.expired"`

### disputeClosed

> `readonly` **disputeClosed**: `"charge.dispute.closed"` = `"charge.dispute.closed"`

### invoicePaid

> `readonly` **invoicePaid**: `"invoice.paid"` = `"invoice.paid"`

### paymentFailed

> `readonly` **paymentFailed**: `"payment_intent.payment_failed"` = `"payment_intent.payment_failed"`

### paymentSucceeded

> `readonly` **paymentSucceeded**: `"payment_intent.succeeded"` = `"payment_intent.succeeded"`

### setupSucceeded

> `readonly` **setupSucceeded**: `"setup_intent.succeeded"` = `"setup_intent.succeeded"`

### subscriptionDeleted

> `readonly` **subscriptionDeleted**: `"customer.subscription.deleted"` = `"customer.subscription.deleted"`

### subscriptionUpdated

> `readonly` **subscriptionUpdated**: `"customer.subscription.updated"` = `"customer.subscription.updated"`
