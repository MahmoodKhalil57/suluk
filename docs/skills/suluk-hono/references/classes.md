# Classes

## errors

### `SulukHttpError`
A typed, throwable HTTP error. `tag` selects the status + title from the frozen core tables; the instance
renders to a Problem Details body via toProblem. Throw one from a handler; `onError()` maps it.
*extends `Error`*
```ts
constructor(tag: ErrorTag, init: SulukHttpErrorInit): SulukHttpError
```
**Properties:**
- `stackTraceLimit: number` — The maximum number of stack frames to capture.
- `prepareStackTrace: (err: Error, stackTraces: CallSite[]) => any` (optional) — Optional override for formatting stack traces
- `tag: ErrorTag`
- `instance: string` (optional)
- `errors: Record<string, unknown>` (optional)
- `problemType: string` (optional)
- `retryAfterMs: number` (optional)
- `logContext: unknown` (optional)
- `detail: string` (optional) — the human `detail` (distinct from Error.message, which mirrors it for stack-trace readability).
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional) — The cause of the error.
**Methods:**
- `isError(value: unknown): value is Error` — Check if a value is an instance of Error
- `captureStackTrace(targetObject: object, constructorOpt?: Function): void` — Create .stack property on a target object
- `toProblem(): ProblemDetails` — render to the canonical RFC-9457 Problem Details body.

## ratelimit

### `MemoryRateLimitStore`
DEV-ONLY fixed-window store — a single in-process Map, ported from saastarter rate-limit.ts:7-38. Per-instance
(does NOT coordinate across workers/isolates) so it must NOT back production; use a @suluk/deploy KV/DO binding
there. Retry-After is the FULL `windowMs` (saastarter parity, rate-limit.ts:35); the precise `resetAt - now` is a
documented alternative a durable store may choose instead.
*implements `RateLimitStore`*
```ts
constructor(): MemoryRateLimitStore
```
**Methods:**
- `consume(key: string, __namedParameters: RateLimitConsumeOptions): RateLimitResult`
