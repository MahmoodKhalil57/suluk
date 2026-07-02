# Configuration

## RateCreditOptions

Wiring knobs. All optional and defaulted — the free-tier gate works out of the box once `RATE_CREDIT_KV` is bound.

### Properties

#### costMicroUsd

The fixed µ$ cost debited per free-tier request. Default: RATE_CREDIT_REQUEST_COST_MICROUSD.

**Type:** `number`

#### dials

The account bucket dials. Default: the module constants ($0.05 burst / $0.01·h refill).

**Type:** `BucketDials`

#### skip

Paths (prefix match) that carry NO principal-charge — health checks, webhooks, etc. Default: `/api/health`.

**Type:** `string[]`

#### now

The clock (default: `Date.now`) — overridable so tests inject a deterministic `now`.

**Type:** `() => number`