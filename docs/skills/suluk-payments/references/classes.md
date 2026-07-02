# Classes

## errors

### `IntegrationError`
Request-phase: bad/missing config, a missing required field, a serialization failure. The caller's bug to fix.
*extends `PaymentLibError`*
```ts
constructor(errorCode: string, message: string): IntegrationError
```
*Inherits 7 properties from `PaymentLibError` — see [`PaymentLibError`](../paymentliberror.md)*
**Methods:**
- `isError(value: unknown): value is Error` — Check if a value is an instance of Error
- `captureStackTrace(targetObject: object, constructorOpt?: Function): void` — Create .stack property on a target object

### `ConnectorError`
Response-phase: the processor returned an unexpected shape the connector couldn't transform.
*extends `PaymentLibError`*
```ts
constructor(errorCode: string, message: string): ConnectorError
```
*Inherits 7 properties from `PaymentLibError` — see [`PaymentLibError`](../paymentliberror.md)*
**Methods:**
- `isError(value: unknown): value is Error` — Check if a value is an instance of Error
- `captureStackTrace(targetObject: object, constructorOpt?: Function): void` — Create .stack property on a target object

### `NetworkError`
Transport: timeout, connection refused, DNS failure — may recover on retry.
*extends `PaymentLibError`*
```ts
constructor(errorCode: string, message: string): NetworkError
```
*Inherits 7 properties from `PaymentLibError` — see [`PaymentLibError`](../paymentliberror.md)*
**Methods:**
- `isError(value: unknown): value is Error` — Check if a value is an instance of Error
- `captureStackTrace(targetObject: object, constructorOpt?: Function): void` — Create .stack property on a target object

### `PaymentLibError`
The error taxonomy (C048) — mirrors Prism's three hard-failure classes. A SOFT decline is NOT one of these: it comes
back in-band as `status: FAILURE` on the response. These are thrown only for request-phase config/validation problems
(`IntegrationError`), unexpected processor responses (`ConnectorError`), and transport failures (`NetworkError`) — so a
caller can distinguish "the card was declined" (in-band, expected) from "the integration is broken" (thrown).
*extends `Error`*
```ts
constructor(errorCode: string, message: string): PaymentLibError
```
**Properties:**
- `stackTraceLimit: number` — The maximum number of stack frames to capture.
- `prepareStackTrace: (err: Error, stackTraces: CallSite[]) => any` (optional) — Optional override for formatting stack traces
- `errorCode: string`
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional) — The cause of the error.
**Methods:**
- `isError(value: unknown): value is Error` — Check if a value is an instance of Error
- `captureStackTrace(targetObject: object, constructorOpt?: Function): void` — Create .stack property on a target object
