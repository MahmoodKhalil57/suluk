[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / HttpOptions

# Interface: HttpOptions

Defined in: [tooling/ts/packages/payments/src/connector.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/connector.ts#L15)

Per-request HTTP tuning + the mockable transport seam (a Worker passes nothing → global fetch; a test passes a mock).

## Properties

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [tooling/ts/packages/payments/src/connector.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/connector.ts#L16)

***

### totalTimeoutMs?

> `optional` **totalTimeoutMs?**: `number`

Defined in: [tooling/ts/packages/payments/src/connector.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/connector.ts#L17)
