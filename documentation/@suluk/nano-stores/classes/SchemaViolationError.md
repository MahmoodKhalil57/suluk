[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / SchemaViolationError

# Class: SchemaViolationError

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/stores.ts#L55)

A validation failure on either edge — carries the Zod issues so callers can surface what drifted.

## Extends

- `Error`

## Constructors

### Constructor

> **new SchemaViolationError**(`side`, `route`, `issues`): `SchemaViolationError`

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/stores.ts#L56)

#### Parameters

##### side

`"request"` \| `"response"`

##### route

`string`

##### issues

`unknown`

#### Returns

`SchemaViolationError`

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

### issues

> `readonly` **issues**: `unknown`

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/stores.ts#L59)

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

### route

> `readonly` **route**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/stores.ts#L58)

***

### side

> `readonly` **side**: `"request"` \| `"response"`

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/stores.ts#L57)

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
