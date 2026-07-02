# Variables & Constants

## access

### `DEFAULT_POLICIES`
The opt-in default mode→policy preset. Adopt by reference, or pass your own matrix to policyFor.
```ts
const DEFAULT_POLICIES: Record<AccessMode, Policy>
```

## errors

### `HttpErrors`
Factory helpers mirroring saastarter's TaggedError set (errors.ts) with the SAME field semantics the route-handler
rendered (route-handler.ts:24-86). `externalService`/`internal` keep their detail GENERIC on the wire and stash
the cause in `logContext` (route-handler.ts:63,81 log it server-side, never leak it).
```ts
const HttpErrors: { unauthorized: (detail?: string) => SulukHttpError; forbidden: (detail?: string, resource?: string) => SulukHttpError; invalidApiKey: (reason: string) => SulukHttpError; validation: (message: string, details?: Record<string, unknown>) => SulukHttpError; notFound: (resource: string, id?: string) => SulukHttpError; conflict: (message: string) => SulukHttpError; payment: (message: string, code?: string) => SulukHttpError; invalidDiscount: (code: string, reason: string) => SulukHttpError; externalService: (service: string, operation: string, cause?: unknown) => SulukHttpError; rateLimited: (retryAfterMs: number) => SulukHttpError; internal: (message?: string, cause?: unknown) => SulukHttpError }
```
