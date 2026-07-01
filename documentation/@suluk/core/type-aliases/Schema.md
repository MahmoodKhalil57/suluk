[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / Schema

# Type Alias: Schema

> **Schema** = `Record`\<`string`, `unknown`\> \| `boolean`

Defined in: [types.ts:513](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/types.ts#L513)

A JSON Schema 2020-12 object (or boolean). Opaque here — validated by the 2020-12 dialect (C013).
May itself contain a JSON-Schema `$ref` keyword (distinct from an OpenAPI Reference Object).
Its `properties[name]` subschemas are the PROPERTY-LEVEL facet locus ([SchemaProperty](../interfaces/SchemaProperty.md)).
