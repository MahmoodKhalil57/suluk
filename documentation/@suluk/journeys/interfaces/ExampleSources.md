[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / ExampleSources

# Interface: ExampleSources

Defined in: [examples/src/index.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/examples/src/index.ts#L26)

The two human-authored tiers a caller may supply; the synthetic tier is derived from the schema.

## Properties

### maintainer?

> `optional` **maintainer?**: `unknown`

Defined in: [examples/src/index.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/examples/src/index.ts#L30)

tier 2 — an explicit maintainer example (overrides the schema's own `examples`/`example`/`const`).

***

### public?

> `optional` **public?**: `unknown`

Defined in: [examples/src/index.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/examples/src/index.ts#L28)

tier 3 (highest) — a tester-curated, willing-to-expose example. After C040-P4 promotion it also lives in Zod meta.
