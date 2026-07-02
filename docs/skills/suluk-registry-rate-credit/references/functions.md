# Functions

## rate-credit.service

### `debitRateCredit`
Lazily regenerate the bucket, then try to debit `costMicroUsd`. Returns `allowed:false` (→ the caller 429s) when the
regenerated balance can't cover the cost. Persists the new balance either way (so the regen is anchored). A cost ≤ 0 is
always allowed and writes nothing. Fail-open on any KV problem or an unbound namespace.
```ts
debitRateCredit(kv: RateCreditKv | undefined, key: string, costMicroUsd: number, nowMs: number, dials: BucketDials): Promise<RateCreditResult>
```
**Parameters:**
- `kv: RateCreditKv | undefined`
- `key: string`
- `costMicroUsd: number`
- `nowMs: number`
- `dials: BucketDials` — default: `ACCOUNT_DIALS`
**Returns:** `Promise<RateCreditResult>`

### `rateCredit`
The credit-backed free-tier limiter as a Hono middleware. Per request (except the skip list): resolve the principal
key, debit the fixed cost from its µ$ bucket, and 429 (RFC-9457) when the bucket can't cover it — otherwise pass. When
`RATE_CREDIT_KV` is unbound (dev), no-op pass and log once.
```ts
rateCredit(opts: RateCreditOptions): MiddlewareHandler
```
**Parameters:**
- `opts: RateCreditOptions` — default: `{}`
**Returns:** `MiddlewareHandler`

### `mountRateCredit`
Apply the credit-backed free-tier limiter to the `/api/*` surface — the global-middleware mount the generated entry
calls as `mountRateCredit(app)` (a cross-cutting concern, not a routed resource). Register it AFTER identity resolves so
the principal is on the context, alongside the fixed-window `rate-limit`.
```ts
mountRateCredit<T>(app: T, opts: RateCreditOptions): T
```
**Parameters:**
- `app: T`
- `opts: RateCreditOptions` — default: `{}`
**Returns:** `T`

### `keyRateDials`
A per-API-key sub-bucket's dials = its SHARE (%) of the account allowance, with burst AND sustained scaled together —
 so a capped key gets a proportional slice of the SAME shared µ$ cost allowance (not a separate budget). `sharePct` is
 clamped to [1,100]; 100 = the full allowance (no extra throttle beyond the shared account bucket). Because both dials
 scale by the same factor, the refill-from-empty TIME is identical at every share — only the burst + throughput shrink.
```ts
keyRateDials(sharePct: number): BucketDials
```
**Parameters:**
- `sharePct: number`
**Returns:** `BucketDials`

### `rateCreditKey`
The KV key for a principal (signed-in user) or an IP.
```ts
rateCreditKey(principal: { userId?: string; ip: string }): string
```
**Parameters:**
- `principal: { userId?: string; ip: string }`
**Returns:** `string`
