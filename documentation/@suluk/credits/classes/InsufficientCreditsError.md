[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / InsufficientCreditsError

# Class: InsufficientCreditsError

Defined in: [tooling/ts/packages/credits/src/credits.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/credits/src/credits.ts#L16)

`@suluk/credits` — a metered credit ledger (C046, extracted verbatim). The package OWNS the schema (`credit_transaction`
+ the `credit_amount`/`credit_key` sidecars); the app injects a Drizzle handle (D1 in prod, bun:sqlite in tests). The
money-correctness core: the ATOMIC `debitIfCovers` (a conditional INSERT that can't drive the ledger negative under
concurrency) + the idempotent `debitOnceIfCovers` (the partial-refund double-spend guard) + per-key spend + the
activity-log query. App-specific payment-alert kinds + the user-table count stay in the app.

## Extends

- `Error`

## Constructors

### Constructor

> **new InsufficientCreditsError**(`balance`, `needed`): `InsufficientCreditsError`

Defined in: [tooling/ts/packages/credits/src/credits.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/credits/src/credits.ts#L17)

#### Parameters

##### balance

`number`

##### needed

`number`

#### Returns

`InsufficientCreditsError`

#### Overrides

`Error.constructor`

## Properties

### balance

> `readonly` **balance**: `number`

Defined in: [tooling/ts/packages/credits/src/credits.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/credits/src/credits.ts#L18)

***

### cause?

> `optional` **cause?**: `unknown`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

The cause of the error.

#### Inherited from

`Error.cause`

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

### needed

> `readonly` **needed**: `number`

Defined in: [tooling/ts/packages/credits/src/credits.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/credits/src/credits.ts#L19)

***

### stack?

> `optional` **stack?**: `string`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.stack`

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

## Methods

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
