[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SchemaProperty

# Interface: SchemaProperty

Defined in: [types.ts:522](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/types.ts#L522)

The PROPERTY-LEVEL facet locus (saastarter-parity Phase 0). core's `x-suluk-*` facets are operation-level
today (on [Request](Request.md)); a Schema Object's `properties[name]` is the locus for a FUTURE property-level
facet — e.g. `@suluk/drizzle` attaching `x-suluk-i18n` to a localized column. This is an ADVISORY typed VIEW
over the opaque [Schema](../type-aliases/Schema.md): it never narrows the runtime Schema type (which stays 2020-12-opaque), so a
property carrying an `x-suluk-*` member is still a valid 2020-12 subschema (the dialect ignores `x-*` keywords).

## Indexable

> \[`facet`: `` `x-suluk-${string}` ``\]: `unknown`

a property subschema may carry any vendor `x-suluk-*` facet (advisory; ignored by the 2020-12 validator).
