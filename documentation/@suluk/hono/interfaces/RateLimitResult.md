[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / RateLimitResult

# Interface: RateLimitResult

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/hono/src/ratelimit.ts#L31)

## Properties

### limited

> **limited**: `boolean`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/hono/src/ratelimit.ts#L33)

true ⇒ this request is OVER the budget and must be rejected.

***

### remaining

> **remaining**: `number`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/hono/src/ratelimit.ts#L35)

requests remaining in the window after this one (≥ 0).

***

### retryAfterMs

> **retryAfterMs**: `number`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/hono/src/ratelimit.ts#L37)

ms until the window resets — drives Retry-After. 0 when not limited.
