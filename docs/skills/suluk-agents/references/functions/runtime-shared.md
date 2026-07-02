# Functions

## runtime-shared

### `routeToolDef`
Derive a route's tool-def from the contract (name + description + input schema + approval gate + paid-tool price).
```ts
routeToolDef(doc: OpenAPIv4Document, routeKey: string, operationRef: string): RouteToolDef
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `routeKey: string`
- `operationRef: string`
**Returns:** `RouteToolDef`

### `paidToolPrice`
Derive an x402 `paidTool` price from an operation's declared `x-suluk-cost` (a `CostModel`, read STRUCTURALLY — no
`@suluk/cost` dep). The price is the FLAT (per-call/per-request) portion: `estimateMicroUsd` if given, else the sum
of flat components' `microUsd`. Usage-metered components (per-token/second/mb/unit) are NEVER folded into the fixed
number — they only set `metered` (so the projection can point at MPP `session` instead). Returns `null` when no
chargeable cost is declared (a free tool stays a plain `tool()`). DECLARED, never enforced (C026 honesty).
```ts
paidToolPrice(cost: unknown): PaidToolPrice | null
```
**Parameters:**
- `cost: unknown`
**Returns:** `PaidToolPrice | null`
