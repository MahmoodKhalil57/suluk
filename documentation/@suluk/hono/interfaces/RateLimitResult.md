[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / RateLimitResult

# Interface: RateLimitResult

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/hono/src/ratelimit.ts#L31)

## Properties

### limited

> **limited**: `boolean`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/hono/src/ratelimit.ts#L33)

true ⇒ this request is OVER the budget and must be rejected.

***

### remaining

> **remaining**: `number`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/hono/src/ratelimit.ts#L35)

requests remaining in the window after this one (≥ 0).

***

### retryAfterMs

> **retryAfterMs**: `number`

Defined in: [tooling/ts/packages/hono/src/ratelimit.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/hono/src/ratelimit.ts#L37)

ms until the window resets — drives Retry-After. 0 when not limited.
