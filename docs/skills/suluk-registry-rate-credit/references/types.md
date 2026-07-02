# Types & Enums

## rate-credit.service

### `RateCreditKv`
A minimal local shape of a Cloudflare KV namespace — just the two members this module touches. Avoids a hard dependency
on `@cloudflare/workers-types` at the module boundary; if your app already pulls that in, this structurally matches
`KVNamespace`.

### `BucketDials`
A token bucket's two dials: its burst ceiling + its sustained refill rate. The account-wide allowance uses the module
 constants; a per-API-key SUB-bucket (keyRateDials) uses a proportional slice of them — same µ$ cost unit.
**Properties:**
- `capMicroUsd: number`
- `regenPerHourMicroUsd: number`

### `RateCreditResult`
**Properties:**
- `allowed: boolean`
- `remaining: number`
- `retryAfterMs: number`

### `RateCreditBindings`
The bindings this module reads: one KV namespace for the buckets. Structurally merged into the app `Bindings`.
**Properties:**
- `RATE_CREDIT_KV: RateCreditKv` (optional) — The KV namespace holding the per-principal µ$ buckets. Provisioned by `@suluk/provision`. Unbound in dev → no-op.
