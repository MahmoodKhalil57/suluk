[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / NetworkError

# Class: NetworkError

Defined in: [tooling/ts/packages/payments/src/errors.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/errors.ts#L24)

Transport: timeout, connection refused, DNS failure — may recover on retry.

## Extends

- [`PaymentLibError`](PaymentLibError.md)

## Constructors

### Constructor

> **new NetworkError**(`errorCode`, `message`): `NetworkError`

Defined in: [tooling/ts/packages/payments/src/errors.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/errors.ts#L8)

#### Parameters

##### errorCode

`string`

##### message

`string`

#### Returns

`NetworkError`

#### Inherited from

[`PaymentLibError`](PaymentLibError.md).[`constructor`](PaymentLibError.md#constructor)

## Properties

### cause?

> `optional` **cause?**: `unknown`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

The cause of the error.

#### Inherited from

[`PaymentLibError`](PaymentLibError.md).[`cause`](PaymentLibError.md#cause)

***

### errorCode

> `readonly` **errorCode**: `string`

Defined in: [tooling/ts/packages/payments/src/errors.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/errors.ts#L9)

#### Inherited from

[`PaymentLibError`](PaymentLibError.md).[`errorCode`](PaymentLibError.md#errorcode)

***

### message

> **message**: `string`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1075

#### Inherited from

[`PaymentLibError`](PaymentLibError.md).[`message`](PaymentLibError.md#message)

***

### name

> **name**: `string`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1074

#### Inherited from

[`PaymentLibError`](PaymentLibError.md).[`name`](PaymentLibError.md#name)

***

### stack?

> `optional` **stack?**: `string`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

[`PaymentLibError`](PaymentLibError.md).[`stack`](PaymentLibError.md#stack)

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

[`PaymentLibError`](PaymentLibError.md).[`prepareStackTrace`](PaymentLibError.md#preparestacktrace)

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: tooling/ts/node\_modules/.bun/bun-types@1.3.14/node\_modules/bun-types/globals.d.ts:1047

The maximum number of stack frames to capture.

#### Inherited from

[`PaymentLibError`](PaymentLibError.md).[`stackTraceLimit`](PaymentLibError.md#stacktracelimit)

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

[`PaymentLibError`](PaymentLibError.md).[`captureStackTrace`](PaymentLibError.md#capturestacktrace)

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

[`PaymentLibError`](PaymentLibError.md).[`captureStackTrace`](PaymentLibError.md#capturestacktrace)

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

[`PaymentLibError`](PaymentLibError.md).[`isError`](PaymentLibError.md#iserror)
