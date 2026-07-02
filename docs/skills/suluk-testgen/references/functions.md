# Functions

## generate

### `generateTests`
`@suluk/testgen` — generate a DETERMINISTIC conformance test suite from a v4 "Suluk" contract. The contract's
claims made executable: the server ENFORCES x-suluk-access on the wire, declared statuses hold, 2xx bodies
conform to their schemas, declared costs are well-formed. A pure function of the document. CANDIDATE tooling.
```ts
generateTests(doc: OpenAPIv4Document, opts: TestgenOptions): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: TestgenOptions` — default: `{}`
**Returns:** `string`

## money

### `generateMoneyTests`
Emit the money-correctness conformance suite as a self-contained test-file string.
```ts
generateMoneyTests(opts: MoneyTestsOptions): string
```
**Parameters:**
- `opts: MoneyTestsOptions` — default: `{}`
**Returns:** `string`
