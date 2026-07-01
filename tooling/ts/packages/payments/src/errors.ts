/**
 * The error taxonomy (C048) — mirrors Prism's three hard-failure classes. A SOFT decline is NOT one of these: it comes
 * back in-band as `status: FAILURE` on the response. These are thrown only for request-phase config/validation problems
 * (`IntegrationError`), unexpected processor responses (`ConnectorError`), and transport failures (`NetworkError`) — so a
 * caller can distinguish "the card was declined" (in-band, expected) from "the integration is broken" (thrown).
 */
export class PaymentLibError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** Request-phase: bad/missing config, a missing required field, a serialization failure. The caller's bug to fix. */
export class IntegrationError extends PaymentLibError {}

/** Response-phase: the processor returned an unexpected shape the connector couldn't transform. */
export class ConnectorError extends PaymentLibError {}

/** Transport: timeout, connection refused, DNS failure — may recover on retry. */
export class NetworkError extends PaymentLibError {}
