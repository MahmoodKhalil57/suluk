[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / SulukHttpError

# Class: SulukHttpError

Defined in: [tooling/ts/packages/hono/src/errors.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L32)

A typed, throwable HTTP error. `tag` selects the status + title from the frozen core tables; the instance
renders to a Problem Details body via [toProblem](#toproblem). Throw one from a handler; `onError()` maps it.

## Extends

- `Error`

## Constructors

### Constructor

> **new SulukHttpError**(`tag`, `init?`): `SulukHttpError`

Defined in: [tooling/ts/packages/hono/src/errors.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L40)

#### Parameters

##### tag

[`ErrorTag`](../../core/type-aliases/ErrorTag.md)

##### init?

[`SulukHttpErrorInit`](../interfaces/SulukHttpErrorInit.md) = `{}`

#### Returns

`SulukHttpError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause?**: `unknown`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

The cause of the error.

#### Inherited from

`Error.cause`

***

### detail?

> `readonly` `optional` **detail?**: `string`

Defined in: [tooling/ts/packages/hono/src/errors.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L53)

the human `detail` (distinct from Error.message, which mirrors it for stack-trace readability).

***

### errors?

> `readonly` `optional` **errors?**: `Record`\<`string`, `unknown`\>

Defined in: [tooling/ts/packages/hono/src/errors.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L35)

***

### instance?

> `readonly` `optional` **instance?**: `string`

Defined in: [tooling/ts/packages/hono/src/errors.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L34)

***

### logContext?

> `readonly` `optional` **logContext?**: `unknown`

Defined in: [tooling/ts/packages/hono/src/errors.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L38)

***

### message

> **message**: `string`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1075

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1074

#### Inherited from

`Error.name`

***

### problemType?

> `readonly` `optional` **problemType?**: `string`

Defined in: [tooling/ts/packages/hono/src/errors.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L36)

***

### retryAfterMs?

> `readonly` `optional` **retryAfterMs?**: `number`

Defined in: [tooling/ts/packages/hono/src/errors.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L37)

***

### stack?

> `optional` **stack?**: `string`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.stack`

***

### tag

> `readonly` **tag**: [`ErrorTag`](../../core/type-aliases/ErrorTag.md)

Defined in: [tooling/ts/packages/hono/src/errors.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L33)

***

### prepareStackTrace?

> `static` `optional` **prepareStackTrace?**: (`err`, `stackTraces`) => `any`

Defined in: node\_modules/@types/node/globals.d.ts:28

Optional override for formatting stack traces

#### Parameters

##### err

`Error`

##### stackTraces

`CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: tooling/ts/node\_modules/.bun/bun-types@1.3.14/node\_modules/bun-types/globals.d.ts:1047

The maximum number of stack frames to capture.

#### Inherited from

`Error.stackTraceLimit`

## Accessors

### retryAfterSeconds

#### Get Signature

> **get** **retryAfterSeconds**(): `number` \| `undefined`

Defined in: [tooling/ts/packages/hono/src/errors.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L61)

seconds for the Retry-After header (RateLimitedError only) — `ceil(retryAfterMs/1000)`, else undefined.

##### Returns

`number` \| `undefined`

***

### status

#### Get Signature

> **get** **status**(): [`ProblemStatus`](../../core/type-aliases/ProblemStatus.md)

Defined in: [tooling/ts/packages/hono/src/errors.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L56)

the HTTP status this error renders as (the frozen core mapping).

##### Returns

[`ProblemStatus`](../../core/type-aliases/ProblemStatus.md)

## Methods

### toProblem()

> **toProblem**(): [`ProblemDetails`](../../core/interfaces/ProblemDetails.md)

Defined in: [tooling/ts/packages/hono/src/errors.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/hono/src/errors.ts#L66)

render to the canonical RFC-9457 Problem Details body.

#### Returns

[`ProblemDetails`](../../core/interfaces/ProblemDetails.md)

***

### captureStackTrace()

#### Call Signature

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Defined in: tooling/ts/node\_modules/.bun/bun-types@1.3.14/node\_modules/bun-types/globals.d.ts:1042

Create .stack property on a target object

##### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

##### Returns

`void`

##### Inherited from

`Error.captureStackTrace`

#### Call Signature

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Defined in: node\_modules/@types/node/globals.d.ts:21

Create .stack property on a target object

##### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

##### Returns

`void`

##### Inherited from

`Error.captureStackTrace`

***

### isError()

> `static` **isError**(`value`): `value is Error`

Defined in: tooling/ts/node\_modules/.bun/bun-types@1.3.14/node\_modules/bun-types/globals.d.ts:1037

Check if a value is an instance of Error

#### Parameters

##### value

`unknown`

The value to check

#### Returns

`value is Error`

True if the value is an instance of Error, false otherwise

#### Inherited from

`Error.isError`
