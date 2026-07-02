[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / ConnectorFactory

# Type Alias: ConnectorFactory

> **ConnectorFactory** = (`auth`, `http?`) => [`PaymentConnector`](../interfaces/PaymentConnector.md)

Defined in: [tooling/ts/packages/payments/src/connector.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/connector.ts#L73)

Builds a connector from its typed auth + http options — what each processor module exports.

## Parameters

### auth

[`ConnectorAuth`](ConnectorAuth.md)

### http?

[`HttpOptions`](../interfaces/HttpOptions.md)

## Returns

[`PaymentConnector`](../interfaces/PaymentConnector.md)
