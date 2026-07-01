/**
 * The agnostic seam (C048) — the `PaymentConnector` interface every processor implements, plus the Prism-style
 * config-selects-the-connector model: you pass ONE `connectorConfig` naming the processor + its credentials, and
 * `paymentClient` returns a connector bound to it. Switching Stripe→Adyen is a config change, not a code change — the
 * whole point. Connectors are FETCH-based (Workers-native); they translate the unified schema to a processor's REST API
 * and its response back. This file is the INTERFACE; concrete connectors (stripe, adyen, …) are separate modules.
 */
import type {
  AuthorizeRequest, PaymentResponse, CaptureRequest, VoidRequest, RefundRequest, RefundResponse, SyncRequest, Secret,
  ClientSession, CreatePaymentSessionRequest, CreateSetupSessionRequest,
} from "./types";
import { IntegrationError } from "./errors";

/** Per-request HTTP tuning + the mockable transport seam (a Worker passes nothing → global fetch; a test passes a mock). */
export interface HttpOptions {
  fetch?: typeof fetch;
  totalTimeoutMs?: number;
}

/**
 * A payment processor behind the unified schema. The CORE flows (authorize/capture/void/refund/sync) are required; the
 * advanced surfaces (customer, tokenize/vault, recurring, webhook) are OPTIONAL — a connector declares them as it gains
 * coverage, and the caller feature-detects. A soft decline is returned as `status: FAILURE`, never thrown.
 */
export interface PaymentConnector {
  /** the processor id, e.g. "stripe". */
  readonly name: string;
  authorize(req: AuthorizeRequest): Promise<PaymentResponse>;
  capture(req: CaptureRequest): Promise<PaymentResponse>;
  void(req: VoidRequest): Promise<PaymentResponse>;
  refund(req: RefundRequest): Promise<RefundResponse>;
  sync(req: SyncRequest): Promise<PaymentResponse>;

  // ── optional advanced surfaces (mirroring Prism's extra clients); added per-connector as supported ──
  /** create a processor customer (returns its id). */
  createCustomer?(req: { email?: string; metadata?: Record<string, string> }): Promise<{ customerId: string }>;
  /** vault an instrument → a reusable token (the app/processor vault; the library stores nothing). */
  tokenize?(req: { customerId?: string; paymentMethod: AuthorizeRequest["paymentMethod"] }): Promise<{ token: Secret }>;
  /** set up an off-session mandate for recurring charges. */
  recurringSetup?(req: { customerId: string; paymentMethod: AuthorizeRequest["paymentMethod"] }): Promise<{ mandateId: string }>;
  /** charge an established recurring mandate off-session. */
  recurringCharge?(req: { mandateId: string; amount: AuthorizeRequest["amount"]; merchantTransactionId: string }): Promise<PaymentResponse>;
  /** revoke a recurring mandate. */
  recurringRevoke?(req: { mandateId: string }): Promise<void>;
  /** verify + normalize a processor webhook into a unified event. */
  handleWebhook?(raw: string, headers: Record<string, string>): Promise<WebhookEvent>;

  // ── the client-token surface (Prism's MerchantAuthenticationClient) — browser-confirmable sessions ──
  /** Create a browser-confirmable PAYMENT session (Stripe PaymentIntent client_secret) — the Payment-Element / one-click
   *  path. The browser confirms with the processor SDK; crediting happens on the webhook, not here. */
  createPaymentSession?(req: CreatePaymentSessionRequest): Promise<ClientSession>;
  /** Create a browser-confirmable SETUP session (Stripe SetupIntent client_secret) — vault a card without charging. */
  createSetupSession?(req: CreateSetupSessionRequest): Promise<ClientSession>;
}

/** A normalized webhook event (the unified shape a connector's handleWebhook produces). */
export interface WebhookEvent {
  type: string;
  connectorTransactionId?: string;
  status?: number;
  raw: unknown;
}

/** A connector's typed credentials (per processor). `Secret`-wrapped so keys aren't logged. */
export type ConnectorAuth = Record<string, Secret | undefined>;

/** The Prism-shaped config: exactly ONE processor named under `connectorConfig`. */
export interface ConnectorConfig {
  connectorConfig: Record<string, ConnectorAuth>;
}

/** Builds a connector from its typed auth + http options — what each processor module exports. */
export type ConnectorFactory = (auth: ConnectorAuth, http?: HttpOptions) => PaymentConnector;

/** The connector registry: processor id → factory. The app composes it from the connector modules it ships. */
export type ConnectorRegistry = Record<string, ConnectorFactory>;

/**
 * The Prism-style entry point: read the single processor named in `config.connectorConfig`, look up its factory in the
 * registry, and return a bound {@link PaymentConnector}. Throws {@link IntegrationError} on a config that names zero, more
 * than one, or an unregistered processor — a request-phase bug, surfaced before any money moves.
 */
export function paymentClient(config: ConnectorConfig, registry: ConnectorRegistry, http?: HttpOptions): PaymentConnector {
  const names = Object.keys(config.connectorConfig ?? {});
  if (names.length !== 1) {
    throw new IntegrationError("INVALID_CONFIGURATION", `connectorConfig must name exactly one processor (got ${names.length}: [${names.join(", ")}])`);
  }
  const name = names[0];
  const factory = registry[name];
  if (!factory) throw new IntegrationError("INVALID_CONFIGURATION", `no connector registered for "${name}" (registry has: [${Object.keys(registry).join(", ")}])`);
  return factory(config.connectorConfig[name], http);
}
