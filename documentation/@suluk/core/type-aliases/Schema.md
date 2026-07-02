[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / Schema

# Type Alias: Schema

> **Schema** = `Record`\<`string`, `unknown`\> \| `boolean`

Defined in: [types.ts:513](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/types.ts#L513)

A JSON Schema 2020-12 object (or boolean). Opaque here — validated by the 2020-12 dialect (C013).
May itself contain a JSON-Schema `$ref` keyword (distinct from an OpenAPI Reference Object).
Its `properties[name]` subschemas are the PROPERTY-LEVEL facet locus ([SchemaProperty](../interfaces/SchemaProperty.md)).
