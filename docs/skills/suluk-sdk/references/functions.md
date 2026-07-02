# Functions

## generate

### `generateSdk`
`@suluk/sdk` — generate a complete, intuitive TypeScript SDK from a v4 "Suluk" contract. ofetch-based,
entity-grouped, fully typed, auth wired, and the v4 superpowers (declared cost + access) surfaced as typed
metadata on each method. A library a developer downloads and uses straight away — not a bag of functions.

  import { generateSdk } from "@suluk/sdk";
  const tsSource = generateSdk(v4Document, { baseURL: "https://api.example.com" }); // a self-contained .ts file
```ts
generateSdk(doc: OpenAPIv4Document, opts: SdkOptions): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: SdkOptions` — default: `{}`
**Returns:** `string`

### `tsType`
A JSON schema → a TS type string (used for typed method inputs + response types).
```ts
tsType(doc: OpenAPIv4Document, schema: unknown, depth: number): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `schema: unknown`
- `depth: number` — default: `0`
**Returns:** `string`

### `resolveOps`
walkOps + DETERMINISTIC method-name collision resolution — SHARED by generateSdk AND generateStores so the client
accessor names (`client.<ns>.<member>`) can NEVER drift between the two projections. Mutates `op.member` in place;
returns the resolved ops + the human-readable collision list (for the SDK header). One source of accessor identity.
```ts
resolveOps(doc: OpenAPIv4Document): { ops: OpInfo[]; collisions: string[] }
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `{ ops: OpInfo[]; collisions: string[] }`

### `clientAccessor`
The client accessor for an op — the dotted path AFTER `client.` (e.g. `paymentMethods.list`). Matches emitTree's
 by-last-namespace-segment grouping, so `createStores` calls EXACTLY the method `generateSdk` emitted.
```ts
clientAccessor(op: OpInfo): string
```
**Parameters:**
- `op: OpInfo`
**Returns:** `string`

## generate-stores

### `generateStores`
generateStores(doc) — project the C037 reactive facet (`x-suluk-store` + `x-suluk-notify`) into a typed Nano Stores
reactive layer (states + mutation→store invalidation + a hookable callback seam) on top of the generated client.

  import { generateSdk, generateStores } from "@suluk/sdk";
  const sdk = generateSdk(doc, { baseURL });   // the typed RPC client
  const stores = generateStores(doc);          // the reactive layer over it (a self-contained .ts file)
```ts
generateStores(doc: OpenAPIv4Document, opts: StoresOptions): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: StoresOptions` — default: `{}`
**Returns:** `string`
