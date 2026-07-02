# Classes

## client

### `CloudflareClient`
`@suluk/cloudflare` — API-driven provisioning + deployment for a Suluk app on Cloudflare, no wrangler CLI. A typed
REST client, idempotent provisioners (D1 / KV / R2 / secrets), the Workers module-script + static-assets upload
flow, and a one-call `deploy()` that wires them in dependency order. The platform that ships itself, shipping
itself — readable, testable, and the same contract-first discipline as the rest of the suite. CANDIDATE tooling.
```ts
constructor(opts: CloudflareClientOptions): CloudflareClient
```
**Properties:**
- `accountId: string | undefined`
**Methods:**
- `request<T>(method: string, path: string, opts: RequestOptions): Promise<T>` — Make a request and return the unwrapped `result`, throwing a CloudflareError when `success` is false.
- `requestText(method: string, path: string, opts: RequestOptions): Promise<string | null>` — Like request but returns the RAW body (no `{success,result}` envelope) — for KV value reads, which
 return the stored value directly. Returns null on 404 (key not found). Never echoes the body into an error.
- `resolveAccountId(): Promise<string>` — Resolve (and cache) the account id — the first account the token can see, unless one was supplied.

### `CloudflareError`
`@suluk/cloudflare` — API-driven provisioning + deployment for a Suluk app on Cloudflare, no wrangler CLI. A typed
REST client, idempotent provisioners (D1 / KV / R2 / secrets), the Workers module-script + static-assets upload
flow, and a one-call `deploy()` that wires them in dependency order. The platform that ships itself, shipping
itself — readable, testable, and the same contract-first discipline as the rest of the suite. CANDIDATE tooling.
*extends `Error`*
```ts
constructor(status: number, errors: CloudflareError_t[], path: string): CloudflareError
```
**Properties:**
- `stackTraceLimit: number` — The maximum number of stack frames to capture.
- `prepareStackTrace: (err: Error, stackTraces: CallSite[]) => any` (optional) — Optional override for formatting stack traces
- `status: number`
- `errors: CloudflareError_t[]`
- `path: string`
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional) — The cause of the error.
**Methods:**
- `isError(value: unknown): value is Error` — Check if a value is an instance of Error
- `captureStackTrace(targetObject: object, constructorOpt?: Function): void` — Create .stack property on a target object
