# Configuration

## RateLimitOptions

The wiring knobs for this module. `operationOf` + `rateLimitOf` are the two facet resolvers @suluk/hono needs
(resolve the contract operation for a request, then look up its declared budget) — pass the ones your emitted
contract gives you. Everything else is optional and defaulted here.

### Properties

#### operationOf

Resolve the contract operation for a request (undefined ⇒ a non-contract path → passed through).

**Type:** `EnforceRateLimitConfig`

**Required:** yes

#### rateLimitOf

The declared rate budget for an operation (e.g. read off the document's `x-suluk-ratelimit`).

**Type:** `EnforceRateLimitConfig`

**Required:** yes

#### store

The durable counter. Default: `MemoryRateLimitStore` (DEV ONLY). PROD: a KV/DO-backed `RateLimitStore`.

**Type:** `any`

#### defaultFacet

A blanket budget for operations that declare none (escape hatch; default: unmetered/opt-in).

**Type:** `any`

#### now

The clock (default: `Date.now`) — overridable so tests inject a deterministic `now`.

**Type:** `() => number`