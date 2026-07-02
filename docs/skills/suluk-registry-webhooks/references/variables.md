# Variables & Constants

## webhooks.service

### `defaultHandlers`
The DEFAULT handler set — a documented STUB. Each entry is a no-op the APP replaces with real fulfillment; we keep it
here (rather than importing `@suluk/credits`) so the webhook module stays decoupled. To wire fulfillment in your repo,
override the map you pass to `WebhooksLive`'s router, e.g. `{ [STRIPE_EVENTS.checkoutCompleted]: (e) => credits.grant(...) }`.
```ts
const defaultHandlers: Record<string, WebhookHandler>
```

### `WebhooksLive`
```ts
const WebhooksLive: any
```

## webhooks.schema

### `webhookEvent`
The at-least-once dedup ledger — one row per PROCESSED Stripe event, so redelivery of the same `evt_…` is a no-op.
```ts
const webhookEvent: any
```

## webhooks.provision

### `webhooksProvision`
```ts
const webhooksProvision: InstanceSpec[]
```

## webhooks.contract

### `webhooksOps`
```ts
const webhooksOps: { method: string; path: string; name: string; summary: string; tags: string[]; errors: number[]; responses: { status: number; description: string }[] }[]
```
