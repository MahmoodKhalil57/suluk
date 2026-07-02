[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/testgen](../README.md) / TestgenOptions

# Interface: TestgenOptions

Defined in: [generate.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/testgen/src/generate.ts#L77)

`@suluk/testgen` — generate a DETERMINISTIC conformance test suite from a v4 "Suluk" contract. The contract's
claims made executable: the server ENFORCES x-suluk-access on the wire, declared statuses hold, 2xx bodies
conform to their schemas, declared costs are well-formed. A pure function of the document. CANDIDATE tooling.

## Properties

### baseURL?

> `optional` **baseURL?**: `string`

Defined in: [generate.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/testgen/src/generate.ts#L79)

the deployment under test; the generated suite reads SULUK_BASE_URL first, then falls back to this.

***

### framework?

> `optional` **framework?**: `"bun"` \| `"vitest"`

Defined in: [generate.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/testgen/src/generate.ts#L81)

which test runner's imports to emit (both share the test/expect/describe API). Default "bun".
