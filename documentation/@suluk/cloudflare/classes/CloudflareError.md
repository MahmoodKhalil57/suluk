[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / CloudflareError

# Class: CloudflareError

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/client.ts#L11)

`@suluk/cloudflare` — API-driven provisioning + deployment for a Suluk app on Cloudflare, no wrangler CLI. A typed
REST client, idempotent provisioners (D1 / KV / R2 / secrets), the Workers module-script + static-assets upload
flow, and a one-call `deploy()` that wires them in dependency order. The platform that ships itself, shipping
itself — readable, testable, and the same contract-first discipline as the rest of the suite. CANDIDATE tooling.

## Extends

- `Error`

## Constructors

### Constructor

> **new CloudflareError**(`status`, `errors`, `path`): `CloudflareError`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/client.ts#L12)

#### Parameters

##### status

`number`

##### errors

`CloudflareError_t`[]

##### path

`string`

#### Returns

`CloudflareError`

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

### errors

> `readonly` **errors**: `CloudflareError_t`[]

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/client.ts#L14)

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

### path

> `readonly` **path**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/client.ts#L15)

***

### stack?

> `optional` **stack?**: `string`

Defined in: tooling/ts/node\_modules/.bun/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.stack`

***

### status

> `readonly` **status**: `number`

Defined in: [tooling/ts/packages/cloudflare/src/client.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/client.ts#L13)

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
