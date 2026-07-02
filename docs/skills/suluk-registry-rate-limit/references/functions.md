# Functions

## rate-limit.service

### `rateLimit`
Build the principal-aware rate-limit middleware. Thin: it only supplies the owned keyer + the store choice and
hands everything to enforceRateLimit, which does the bucket math and emits 429 + Retry-After.
```ts
rateLimit(opts: RateLimitOptions): MiddlewareHandler
```
**Parameters:**
- `opts: RateLimitOptions`
**Returns:** `MiddlewareHandler`

### `mountRateLimit`
Apply principal-aware rate limiting to EVERY request — the global-middleware mount the generated entry calls as
`mountRateLimit(app)` (a cross-cutting concern, not a routed resource). DEFAULT is opt-in: the resolvers decline, so
every request passes UNTIL you wire `operationOf`/`rateLimitOf` from your emitted v4 contract (and swap a durable
`store` for prod). Register it after identity resolves so the principal is on the context.
```ts
mountRateLimit<T>(app: T, opts: RateLimitOptions): T
```
**Parameters:**
- `app: T`
- `opts: RateLimitOptions` — default: `...`
**Returns:** `T`
