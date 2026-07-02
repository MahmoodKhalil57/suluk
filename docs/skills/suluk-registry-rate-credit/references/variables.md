# Variables & Constants

## rate-credit.service

### `RATE_CREDIT_CAP_MICROUSD`
```ts
const RATE_CREDIT_CAP_MICROUSD: 50000
```

### `RATE_CREDIT_REGEN_PER_HOUR_MICROUSD`
```ts
const RATE_CREDIT_REGEN_PER_HOUR_MICROUSD: 10000
```

### `RATE_CREDIT_REQUEST_COST_MICROUSD`
The fixed µ$ cost a single free-tier request debits (a whole free bucket ≈ 50 requests of burst, ~10/hour sustained).
```ts
const RATE_CREDIT_REQUEST_COST_MICROUSD: 1000
```
