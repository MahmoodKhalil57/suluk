[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / HttpOptions

# Interface: HttpOptions

Defined in: [tooling/ts/packages/payments/src/connector.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/payments/src/connector.ts#L15)

Per-request HTTP tuning + the mockable transport seam (a Worker passes nothing → global fetch; a test passes a mock).

## Properties

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [tooling/ts/packages/payments/src/connector.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/payments/src/connector.ts#L16)

***

### totalTimeoutMs?

> `optional` **totalTimeoutMs?**: `number`

Defined in: [tooling/ts/packages/payments/src/connector.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/payments/src/connector.ts#L17)
