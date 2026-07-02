[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/testgen](../README.md) / generateTests

# Function: generateTests()

> **generateTests**(`doc`, `opts?`): `string`

Defined in: [generate.ts:149](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/testgen/src/generate.ts#L149)

`@suluk/testgen` — generate a DETERMINISTIC conformance test suite from a v4 "Suluk" contract. The contract's
claims made executable: the server ENFORCES x-suluk-access on the wire, declared statuses hold, 2xx bodies
conform to their schemas, declared costs are well-formed. A pure function of the document. CANDIDATE tooling.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`TestgenOptions`](../interfaces/TestgenOptions.md) = `{}`

## Returns

`string`
