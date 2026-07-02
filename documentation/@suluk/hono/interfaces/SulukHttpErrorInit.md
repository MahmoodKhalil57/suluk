[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / SulukHttpErrorInit

# Interface: SulukHttpErrorInit

Defined in: [tooling/ts/packages/hono/src/errors.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/errors.ts#L13)

## Properties

### detail?

> `optional` **detail?**: `string`

Defined in: [tooling/ts/packages/hono/src/errors.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/errors.ts#L15)

the human-readable explanation (RFC-9457 `detail`).

***

### errors?

> `optional` **errors?**: `Record`\<`string`, `unknown`\>

Defined in: [tooling/ts/packages/hono/src/errors.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/errors.ts#L19)

structured validation errors (saastarter's `details`).

***

### instance?

> `optional` **instance?**: `string`

Defined in: [tooling/ts/packages/hono/src/errors.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/errors.ts#L17)

a URI reference identifying the specific occurrence (RFC-9457 `instance`).

***

### logContext?

> `optional` **logContext?**: `unknown`

Defined in: [tooling/ts/packages/hono/src/errors.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/errors.ts#L25)

server-only diagnostic context (cause/service/op) — LOGGED by onError, never sent on the wire.

***

### retryAfterMs?

> `optional` **retryAfterMs?**: `number`

Defined in: [tooling/ts/packages/hono/src/errors.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/errors.ts#L23)

RateLimitedError: ms until the window resets — drives the Retry-After header (route-handler.ts:75).

***

### type?

> `optional` **type?**: `string`

Defined in: [tooling/ts/packages/hono/src/errors.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/errors.ts#L21)

override the `type` URI (default "about:blank").
