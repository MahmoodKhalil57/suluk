[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / Schema

# Type Alias: Schema

> **Schema** = `Record`\<`string`, `unknown`\> \| `boolean`

Defined in: [types.ts:513](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L513)

A JSON Schema 2020-12 object (or boolean). Opaque here — validated by the 2020-12 dialect (C013).
May itself contain a JSON-Schema `$ref` keyword (distinct from an OpenAPI Reference Object).
Its `properties[name]` subschemas are the PROPERTY-LEVEL facet locus ([SchemaProperty](../interfaces/SchemaProperty.md)).
