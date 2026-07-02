[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / EnforceRateLimitConfig

# Interface: EnforceRateLimitConfig

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:74](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/hono/src/ratelimit.ts#L74)

## Properties

### defaultFacet?

> `optional` **defaultFacet?**: [`SulukRateLimit`](../../core/interfaces/SulukRateLimit.md)

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/hono/src/ratelimit.ts#L86)

A blanket budget applied to operations that declare none (escape hatch; default: unmetered).

***

### keyOf?

> `optional` **keyOf?**: (`c`, `facet`) => `string`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/hono/src/ratelimit.ts#L82)

Derive the caller key from a request + facet (default: client IP from x-forwarded-for / x-real-ip).

#### Parameters

##### c

`Context`

##### facet

[`SulukRateLimit`](../../core/interfaces/SulukRateLimit.md)

#### Returns

`string`

***

### now?

> `optional` **now?**: () => `number`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/hono/src/ratelimit.ts#L84)

The clock (default: `Date.now`) — the single source of `now`.

#### Returns

`number`

***

### operationOf

> **operationOf**: (`c`) => `string` \| `undefined`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/hono/src/ratelimit.ts#L76)

Resolve the contract operation for a request (undefined ⇒ a non-contract path, passed through).

#### Parameters

##### c

`Context`

#### Returns

`string` \| `undefined`

***

### rateLimitOf

> **rateLimitOf**: (`operation`) => [`SulukRateLimit`](../../core/interfaces/SulukRateLimit.md) \| `undefined`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/hono/src/ratelimit.ts#L78)

The declared rate budget for an operation (e.g. read off the document's `x-suluk-ratelimit`).

#### Parameters

##### operation

`string`

#### Returns

[`SulukRateLimit`](../../core/interfaces/SulukRateLimit.md) \| `undefined`

***

### store?

> `optional` **store?**: [`RateLimitStore`](RateLimitStore.md)

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/hono/src/ratelimit.ts#L80)

The durable counter (default: a per-instance [MemoryRateLimitStore](../classes/MemoryRateLimitStore.md) — DEV ONLY).
