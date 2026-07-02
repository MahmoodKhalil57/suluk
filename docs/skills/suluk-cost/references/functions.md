# Functions

## types

### `formatMicroUsd`
Format micro-USD as a display string (we store raw integers; this is only for humans).
```ts
formatMicroUsd(microUsd: number): string
```
**Parameters:**
- `microUsd: number`
**Returns:** `string`

## settlement

### `settlementOf`
The settlement declared on an operation's cost.
```ts
settlementOf(req: Request): CostSettlement | undefined
```
**Parameters:**
- `req: Request`
**Returns:** `CostSettlement | undefined`

### `settlementAudit`
Audit that every PRICED operation names HOW it is settled, and that the named lever is coherent — the generic form of
toolfactory's "cost names a lever" governance check.
```ts
settlementAudit(doc: OpenAPIv4Document): SettlementFinding[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `SettlementFinding[]`

### `impliedErrorStatuses`
The HTTP error statuses a request's FACETS imply (the generic form of toolfactory's errors-gate): a contract should
declare these responses. credit→402 · authenticated/admin→401 · owner-scope→403 · rate-limit→429 · an upstream
third-party call (a `per-request` cost component)→502. A pure function of the declared facets.
```ts
impliedErrorStatuses(req: Request): number[]
```
**Parameters:**
- `req: Request`
**Returns:** `number[]`

### `settlementRollup`
A quick "how is this API monetized" tally — ops grouped by settlement method (+ priced-but-unsettled).
```ts
settlementRollup(doc: OpenAPIv4Document): SettlementRollup
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `SettlementRollup`

## contract

### `annotateCosts`
Annotate a v4 document in place-safe (returns a new doc): set x-suluk-cost on each named operation (incl. webhooks).
```ts
annotateCosts(doc: OpenAPIv4Document, costs: Record<string, CostModel>): OpenAPIv4Document
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `costs: Record<string, CostModel>`
**Returns:** `OpenAPIv4Document`

### `costOf`
Read the cost model declared on an operation (if any).
```ts
costOf(req: Request): CostModel | undefined
```
**Parameters:**
- `req: Request`
**Returns:** `CostModel | undefined`

### `costAudit`
Cost-coverage audit: which operations have NOT declared what they cost — plus (C024) the background-cost
disciplines: a deferred cost that resolves no principal would bill to `@unattributed` (fail LOUD, never silent),
and an attribution read off an UNVERIFIED event payload is attacker-controllable. Walks paths AND webhooks.
```ts
costAudit(doc: OpenAPIv4Document): CostFinding[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `CostFinding[]`

### `costTable`
The declared costs across the document (paths + webhooks + jobs), for display (the cockpit/admin show this raw).
```ts
costTable(doc: OpenAPIv4Document): CostRow[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `CostRow[]`

### `computeCost`
Compute the actual µ$ a request cost, from its declared model + the usage the handler reported. Fixed
(per-call) components always count; variable components count their reported units × unit cost. Returns
the per-source breakdown + total — raw, for the meter to record.
```ts
computeCost(model: CostModel | undefined, usage: UsageReport[]): { breakdown: { source: string; microUsd: number }[]; totalMicroUsd: number }
```
**Parameters:**
- `model: CostModel | undefined`
- `usage: UsageReport[]` — default: `[]`
**Returns:** `{ breakdown: { source: string; microUsd: number }[]; totalMicroUsd: number }`

### `eachOperation`
Every named operation in the document — path requests AND C018 webhooks (which are Requests carrying facets) —
as {path, name, req}. Background-event cost lives on a webhook op, so every cost reader walks this, not just paths.
```ts
eachOperation(doc: OpenAPIv4Document): { path: string; name: string; req: Request }[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `{ path: string; name: string; req: Request }[]`

### `eachJob`
Every background JOB (C025) on the document, as {path, name, job} — non-HTTP cron/queue work.
```ts
eachJob(doc: OpenAPIv4Document): { path: string; name: string; job: SulukJob }[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `{ path: string; name: string; job: SulukJob }[]`

### `triggerOf`
The trigger an operation's cost declares (C024; default "synchronous").
```ts
triggerOf(model: CostModel | undefined): CostTrigger
```
**Parameters:**
- `model: CostModel | undefined`
**Returns:** `CostTrigger`

### `isDeferredCost`
Does this cost accrue on a BACKGROUND event (a non-synchronous trigger) rather than the declaring op's own run?
```ts
isDeferredCost(model: CostModel | undefined): boolean
```
**Parameters:**
- `model: CostModel | undefined`
**Returns:** `boolean`

## meter

### `costMeter`
Hono middleware: after the handler runs, record what the request cost (declared model + reported usage).
```ts
costMeter(opts: CostMeterOptions): MiddlewareHandler
```
**Parameters:**
- `opts: CostMeterOptions`
**Returns:** `MiddlewareHandler`

### `recordUsage`
A handler calls this to report MEASURED third-party usage for the current request (e.g. tokens used).
```ts
recordUsage(c: Context, source: string, units: number): void
```
**Parameters:**
- `c: Context`
- `source: string`
- `units: number`

## event

### `resolveEventExpression`
Resolve a C018 runtime-expression against a fired event. Supports `{$event.id}`, `{$event.<key>}`, and a
JSON-Pointer tail `{$event.body#/customer}` / `{$event.body#/data/object/customer}`. Returns the stringified
value, or undefined when it doesn't resolve. Pure; never throws (an unresolvable expression is undefined, not an error).
```ts
resolveEventExpression(expression: string, event: Record<string, unknown>): string | undefined
```
**Parameters:**
- `expression: string`
- `event: Record<string, unknown>`
**Returns:** `string | undefined`

### `attributePrincipal`
Resolve the principal charged for a fired event per the model's attribution strategy. Returns the `@unattributed`
sentinel (never silent) when nothing resolves: `session`/`job-stamped` use the supplied principal; `event-expression`
reads it from the payload. NOTE: an `event-expression` with `trust !== "verified"` is attacker-controllable — the
caller MUST gate it behind a verified webhook signature before trusting the result for billing.
```ts
attributePrincipal(model: CostModel, event: Record<string, unknown>, suppliedPrincipal?: string): string
```
**Parameters:**
- `model: CostModel`
- `event: Record<string, unknown>`
- `suppliedPrincipal: string` (optional)
**Returns:** `string`

### `eventCostEvent`
Build the CostEvent for a FIRED background event — pure. Stamps the trigger, resolves principal + dedupeKey,
 and (C026) uses the payload-reconciled amount as the authoritative total when the model declares one.
```ts
eventCostEvent(input: EventCostInput): CostEvent
```
**Parameters:**
- `input: EventCostInput`
**Returns:** `CostEvent`

### `recordEventCost`
Record a fired event's cost into a sink, deduped by its `dedupeKey` against `seen` (so at-least-once delivery
can't double-charge). Returns the recorded event, or null when it was a duplicate. `seen` is the app's dedup
store (an in-memory Set for dev; a durable KV/DO for prod).
```ts
recordEventCost(sink: CostSink, input: EventCostInput, seen?: Set<string>): Promise<CostEvent | null>
```
**Parameters:**
- `sink: CostSink`
- `input: EventCostInput`
- `seen: Set<string>` (optional)
**Returns:** `Promise<CostEvent | null>`

### `reconciledAmount`
Resolve the ACTUAL charged amount (in µ$) from the event when the model is `payload-reconciled` (C026), else
undefined. Reads the runtime amount-expression (e.g. the Stripe event amount) and converts from its declared unit
— so the recorded cost is the third party's real invoice line, not the operator's declared estimate.
```ts
reconciledAmount(model: CostModel, event: Record<string, unknown>): number | undefined
```
**Parameters:**
- `model: CostModel`
- `event: Record<string, unknown>`
**Returns:** `number | undefined`

## ledger

### `summarize`
```ts
summarize(events: CostEvent[]): CostSummary
```
**Parameters:**
- `events: CostEvent[]`
**Returns:** `CostSummary`

### `principalCost`
What ONE principal cost you (the question that lets you price them) — and the trace by operation + action.
```ts
principalCost(events: CostEvent[], principal: string): CostSummary
```
**Parameters:**
- `events: CostEvent[]`
- `principal: string`
**Returns:** `CostSummary`
