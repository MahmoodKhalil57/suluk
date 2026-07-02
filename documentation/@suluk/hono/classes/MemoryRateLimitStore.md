[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / MemoryRateLimitStore

# Class: MemoryRateLimitStore

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/ratelimit.ts#L55)

DEV-ONLY fixed-window store — a single in-process Map, ported from saastarter rate-limit.ts:7-38. Per-instance
(does NOT coordinate across workers/isolates) so it must NOT back production; use a @suluk/deploy KV/DO binding
there. Retry-After is the FULL `windowMs` (saastarter parity, rate-limit.ts:35); the precise `resetAt - now` is a
documented alternative a durable store may choose instead.

## Implements

- [`RateLimitStore`](../interfaces/RateLimitStore.md)

## Constructors

### Constructor

> **new MemoryRateLimitStore**(): `MemoryRateLimitStore`

#### Returns

`MemoryRateLimitStore`

## Methods

### consume()

> **consume**(`key`, `__namedParameters`): [`RateLimitResult`](../interfaces/RateLimitResult.md)

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/ratelimit.ts#L58)

#### Parameters

##### key

`string`

##### \_\_namedParameters

[`RateLimitConsumeOptions`](../interfaces/RateLimitConsumeOptions.md)

#### Returns

[`RateLimitResult`](../interfaces/RateLimitResult.md)

#### Implementation of

[`RateLimitStore`](../interfaces/RateLimitStore.md).[`consume`](../interfaces/RateLimitStore.md#consume)
