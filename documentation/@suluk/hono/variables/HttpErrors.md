[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / HttpErrors

# Variable: HttpErrors

> `const` **HttpErrors**: `object`

Defined in: [tooling/ts/packages/hono/src/errors.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/hono/src/errors.ts#L82)

Factory helpers mirroring saastarter's TaggedError set (errors.ts) with the SAME field semantics the route-handler
rendered (route-handler.ts:24-86). `externalService`/`internal` keep their detail GENERIC on the wire and stash
the cause in `logContext` (route-handler.ts:63,81 log it server-side, never leak it).

## Type Declaration

### conflict

> **conflict**: (`message`) => [`SulukHttpError`](../classes/SulukHttpError.md)

409 (route-handler.ts:53-54).

#### Parameters

##### message

`string`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### externalService

> **externalService**: (`service`, `operation`, `cause?`) => [`SulukHttpError`](../classes/SulukHttpError.md)

502 (route-handler.ts:62-67); GENERIC wire detail, cause logged only.

#### Parameters

##### service

`string`

##### operation

`string`

##### cause?

`unknown`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### forbidden

> **forbidden**: (`detail?`, `resource?`) => [`SulukHttpError`](../classes/SulukHttpError.md)

403 (route-handler.ts:32-36); `resource` becomes the instance.

#### Parameters

##### detail?

`string`

##### resource?

`string`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### internal

> **internal**: (`message?`, `cause?`) => [`SulukHttpError`](../classes/SulukHttpError.md)

500 (route-handler.ts:80-85); GENERIC wire detail, cause logged only.

#### Parameters

##### message?

`string`

##### cause?

`unknown`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### invalidApiKey

> **invalidApiKey**: (`reason`) => [`SulukHttpError`](../classes/SulukHttpError.md)

401 (route-handler.ts:38-39); the key reason is the detail.

#### Parameters

##### reason

`string`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### invalidDiscount

> **invalidDiscount**: (`code`, `reason`) => [`SulukHttpError`](../classes/SulukHttpError.md)

400 (route-handler.ts:59-60); the discount code → errors, reason → detail.

#### Parameters

##### code

`string`

##### reason

`string`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### notFound

> **notFound**: (`resource`, `id?`) => [`SulukHttpError`](../classes/SulukHttpError.md)

404 (route-handler.ts:47-51); detail is `${resource} not found`, id → instance.

#### Parameters

##### resource

`string`

##### id?

`string`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### payment

> **payment**: (`message`, `code?`) => [`SulukHttpError`](../classes/SulukHttpError.md)

402 (route-handler.ts:56-57); optional Stripe-style `code` → errors.

#### Parameters

##### message

`string`

##### code?

`string`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### rateLimited

> **rateLimited**: (`retryAfterMs`) => [`SulukHttpError`](../classes/SulukHttpError.md)

429 (route-handler.ts:69-78); retryAfterMs drives the Retry-After header.

#### Parameters

##### retryAfterMs

`number`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### unauthorized

> **unauthorized**: (`detail?`) => [`SulukHttpError`](../classes/SulukHttpError.md)

401 (route-handler.ts:26-30).

#### Parameters

##### detail?

`string`

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)

### validation

> **validation**: (`message`, `details?`) => [`SulukHttpError`](../classes/SulukHttpError.md)

400 (route-handler.ts:41-45); `details` → `errors`.

#### Parameters

##### message

`string`

##### details?

`Record`\<`string`, `unknown`\>

#### Returns

[`SulukHttpError`](../classes/SulukHttpError.md)
