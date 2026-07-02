# Variables & Constants

## cost.service

### `CostLive`
```ts
const CostLive: any
```

## cost.schema

### `costEvent`
One recorded cost — the raw, per-request/per-event picture. `breakdown` is the JSON per-source array.
```ts
const costEvent: any
```

### `costDedup`
The at-least-once dedup ledger — a background event's `dedupeKey` recorded once, so redelivery is a no-op.
```ts
const costDedup: any
```

## cost.provision

### `costProvision`
```ts
const costProvision: InstanceSpec[]
```

## cost.contract

### `costOps`
```ts
const costOps: { method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; responses: { status: number; description: string }[] }[]
```
