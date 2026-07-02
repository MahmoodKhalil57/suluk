# Functions

## conformance

### `conformanceGates`
The CONFORMANCE gates — the readiness dimensions, each composed from a shipped Suluk audit. No host needed.
```ts
conformanceGates(doc: OpenAPIv4Document): Gate[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `Gate[]`

### `assertConformance`
CI gate (the hard incentive): throw if any conformance gate is an `error` (a blocker). Returns the gates otherwise.
```ts
assertConformance(doc: OpenAPIv4Document): Gate[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `Gate[]`
