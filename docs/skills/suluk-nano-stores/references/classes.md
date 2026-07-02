# Classes

## stores

### `SchemaViolationError`
A validation failure on either edge — carries the Zod issues so callers can surface what drifted.
*extends `Error`*
```ts
constructor(side: "request" | "response", route: string, issues: unknown): SchemaViolationError
```
**Properties:**
- `stackTraceLimit: number` — The maximum number of stack frames to capture.
- `prepareStackTrace: (err: Error, stackTraces: CallSite[]) => any` (optional) — Optional override for formatting stack traces
- `side: "request" | "response"`
- `route: string`
- `issues: unknown`
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional) — The cause of the error.
**Methods:**
- `isError(value: unknown): value is Error` — Check if a value is an instance of Error
- `captureStackTrace(targetObject: object, constructorOpt?: Function): void` — Create .stack property on a target object
