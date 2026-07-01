[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/examples](../README.md) / ExampleSources

# Interface: ExampleSources

Defined in: [index.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/examples/src/index.ts#L26)

The two human-authored tiers a caller may supply; the synthetic tier is derived from the schema.

## Properties

### maintainer?

> `optional` **maintainer?**: `unknown`

Defined in: [index.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/examples/src/index.ts#L30)

tier 2 — an explicit maintainer example (overrides the schema's own `examples`/`example`/`const`).

***

### public?

> `optional` **public?**: `unknown`

Defined in: [index.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/examples/src/index.ts#L28)

tier 3 (highest) — a tester-curated, willing-to-expose example. After C040-P4 promotion it also lives in Zod meta.
