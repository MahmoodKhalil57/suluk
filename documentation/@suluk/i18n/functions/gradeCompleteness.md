[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / gradeCompleteness

# Function: gradeCompleteness()

> **gradeCompleteness**(`defaultCatalog`, `localeCatalog`, `locale`): [`CompletenessGrade`](../interfaces/CompletenessGrade.md)

Defined in: [messages.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/i18n/src/messages.ts#L66)

Grade a locale catalog against the default catalog — the runtime, harden-style completeness gauge that complements
the compile-time key-parity types. Surfaces missing/extra keys + a 0–1 grade so a locale's coverage is auditable.

## Parameters

### defaultCatalog

[`Catalog`](../type-aliases/Catalog.md)

### localeCatalog

[`Catalog`](../type-aliases/Catalog.md)

### locale

`string`

## Returns

[`CompletenessGrade`](../interfaces/CompletenessGrade.md)
