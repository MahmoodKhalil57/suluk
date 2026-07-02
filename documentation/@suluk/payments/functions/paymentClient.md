[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / paymentClient

# Function: paymentClient()

> **paymentClient**(`config`, `registry`, `http?`): [`PaymentConnector`](../interfaces/PaymentConnector.md)

Defined in: [tooling/ts/packages/payments/src/connector.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/connector.ts#L83)

The Prism-style entry point: read the single processor named in `config.connectorConfig`, look up its factory in the
registry, and return a bound [PaymentConnector](../interfaces/PaymentConnector.md). Throws [IntegrationError](../classes/IntegrationError.md) on a config that names zero, more
than one, or an unregistered processor — a request-phase bug, surfaced before any money moves.

## Parameters

### config

[`ConnectorConfig`](../interfaces/ConnectorConfig.md)

### registry

[`ConnectorRegistry`](../type-aliases/ConnectorRegistry.md)

### http?

[`HttpOptions`](../interfaces/HttpOptions.md)

## Returns

[`PaymentConnector`](../interfaces/PaymentConnector.md)
