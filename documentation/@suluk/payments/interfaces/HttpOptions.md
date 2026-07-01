[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / HttpOptions

# Interface: HttpOptions

Defined in: [tooling/ts/packages/payments/src/connector.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/connector.ts#L15)

Per-request HTTP tuning + the mockable transport seam (a Worker passes nothing → global fetch; a test passes a mock).

## Properties

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [tooling/ts/packages/payments/src/connector.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/connector.ts#L16)

***

### totalTimeoutMs?

> `optional` **totalTimeoutMs?**: `number`

Defined in: [tooling/ts/packages/payments/src/connector.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/connector.ts#L17)
