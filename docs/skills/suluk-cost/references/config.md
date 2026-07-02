# Configuration

## CostMeterOptions

### Properties

#### sink

**Type:** `CostSink`

**Required:** yes

#### costs

operation name → its declared cost model.

**Type:** `Record<string, CostModel>`

**Required:** yes

#### operationOf

Resolve the operation name for a request (e.g. c.get("operation"), or a matcher).

**Type:** `(c: Context) => string | undefined`

**Required:** yes

#### principalOf

Resolve the principal/user id (default: none).

**Type:** `(c: Context) => string | undefined`

#### actionHeader

Header carrying the frontend action id (default "x-suluk-action").

**Type:** `string`

#### now

Wall-clock now (ms). Pass `() => Date.now()` in production; a fixed fn in tests for reproducibility.

**Type:** `() => number`