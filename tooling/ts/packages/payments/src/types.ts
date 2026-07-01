/**
 * The unified payment schema (C048) — a Workers-native TypeScript reimplementation of the Hyperswitch Prism interface.
 * Prism ships as a native FFI addon (Rust core) that can't run in a Cloudflare Worker, so we adopt its INTERFACE — one
 * request schema for every processor — and implement it ourselves over `fetch` (zero native deps, edge-safe). The status
 * enums mirror Prism's INTEGER values exactly, so a real Prism backend stays a drop-in later and connector semantics
 * match. Sensitive values are wrapped in {@link Secret} (a PCI-scope signal — the library never logs them).
 */

/** A processor-side secret / PII value — wrapped so it's explicit at every call site and never accidentally logged. */
export type Secret<T = string> = { value: T };

/** ISO-4217 currency. A curated set for `Currency.USD`-style access; open to any code a connector accepts. */
export const Currency = { USD: "USD", EUR: "EUR", GBP: "GBP", AED: "AED", SAR: "SAR", INR: "INR", CAD: "CAD", AUD: "AUD" } as const;
export type Currency = (typeof Currency)[keyof typeof Currency] | (string & {});

/** Auto-capture on authorize, or authorize-then-capture-later. */
export enum CaptureMethod {
  AUTOMATIC = "AUTOMATIC",
  MANUAL = "MANUAL",
}

/** 3-D Secure preference. */
export enum AuthenticationType {
  NO_THREE_DS = "NO_THREE_DS",
  THREE_DS = "THREE_DS",
}

/**
 * Payment status — INTEGER values mirroring Prism exactly (do NOT renumber; a real Prism backend + connector code depend
 * on these). A soft decline is `FAILURE` returned IN-BAND on the response (never thrown). Use with authorize/capture/void.
 */
export enum PaymentStatus {
  UNSPECIFIED = 0,
  STARTED = 1,
  AUTHENTICATION_FAILED = 2,
  ROUTER_DECLINED = 3,
  AUTHENTICATION_PENDING = 4,
  AUTHENTICATION_SUCCESSFUL = 5,
  AUTHORIZED = 6,
  AUTHORIZATION_FAILED = 7,
  CHARGED = 8,
  VOIDED = 11,
  VOID_INITIATED = 12,
  CAPTURE_INITIATED = 13,
  CAPTURE_FAILED = 14,
  VOID_FAILED = 15,
  PARTIAL_CHARGED = 17,
  UNRESOLVED = 19,
  PENDING = 20,
  FAILURE = 21,
  PARTIALLY_AUTHORIZED = 25,
  EXPIRED = 26,
}

/** Refund status — a SEPARATE enum from {@link PaymentStatus} with overlapping integers (mirrors Prism). `REFUND_PENDING`
 *  is a normal success state for many processors — treat PENDING + SUCCESS both as success. */
export enum RefundStatus {
  UNSPECIFIED = 0,
  REFUND_FAILURE = 1,
  REFUND_MANUAL_REVIEW = 2,
  REFUND_PENDING = 3,
  REFUND_SUCCESS = 4,
  REFUND_TRANSACTION_FAILURE = 5,
}

/** An amount in the currency's minor unit (cents), the Prism convention (no floats in the money path). */
export interface MinorAmount {
  minorAmount: number;
  currency: Currency;
}

export interface CardDetails {
  cardNumber: Secret;
  cardExpMonth: Secret;
  cardExpYear: Secret;
  cardCvc: Secret;
  cardHolderName?: Secret;
}

/** The payment instrument. Extend with wallet / bank-transfer as connectors gain coverage; card + token are the core.
 *  `token` is a saved/vaulted instrument id (the app's or the processor's vault — the library stores nothing). */
export interface PaymentMethod {
  card?: CardDetails;
  token?: Secret;
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderDetail {
  description: string;
  quantity?: number;
  amount?: number;
}

/** A structured error the library surfaces (in-band on FAILURE, or on a thrown IntegrationError/ConnectorError). Only
 *  primitive fields — never a processor's raw object (which may not be serializable). */
export interface PaymentError {
  message?: string;
  code?: string;
  reason?: string;
}

/** Where to send the customer for 3DS / redirect flows (present when status is AUTHENTICATION_PENDING). */
export interface RedirectionData {
  url?: string;
  method?: "GET" | "POST";
  fields?: Record<string, string>;
}

// ── Requests / responses (mirroring Prism's PaymentService* shapes) ───────────────────────────────────────────────────

export interface AuthorizeRequest {
  merchantTransactionId: string;
  amount: MinorAmount;
  captureMethod: CaptureMethod;
  paymentMethod: PaymentMethod;
  authType: AuthenticationType;
  address?: Address;
  returnUrl?: string;
  orderDetails?: OrderDetail[];
  /** an existing processor customer to attach the charge to (optional). */
  customerId?: string;
  /** save the instrument for later off-session use (recurring / one-click). */
  setupFutureUsage?: boolean;
  /** the charge is happening WITHOUT the cardholder present (auto top-up / recurring) — the processor may decline for
   *  3DS (`AUTHENTICATION_PENDING`) rather than charge. Maps to Stripe `off_session`, Adyen `ContAuth`, etc. */
  offSession?: boolean;
  /** free-form key/value the processor stores + echoes on its webhook (e.g. `{ userId, credits }` the crediting path
   *  reads). Most processors support it (Stripe metadata, Adyen additionalData). */
  metadata?: Record<string, string>;
  testMode?: boolean;
}

export interface PaymentResponse {
  status: PaymentStatus;
  connectorTransactionId?: string;
  redirectionData?: RedirectionData;
  error?: PaymentError;
  /** the amount actually captured/authorized, when the processor reports it. */
  amount?: MinorAmount;
}

export interface CaptureRequest {
  merchantCaptureId: string;
  connectorTransactionId: string;
  amountToCapture: MinorAmount;
  testMode?: boolean;
}

export interface VoidRequest {
  merchantVoidId: string;
  connectorTransactionId: string;
  cancellationReason?: string;
  testMode?: boolean;
}

export interface RefundRequest {
  merchantRefundId: string;
  connectorTransactionId: string;
  refundAmount: MinorAmount;
  /** the ORIGINAL payment amount (minor units) — some processors require it to compute a partial refund. */
  paymentAmount: number;
  reason?: string;
  testMode?: boolean;
}

export interface RefundResponse {
  status: RefundStatus;
  connectorRefundId?: string;
  error?: PaymentError;
}

export interface SyncRequest {
  connectorTransactionId: string;
  testMode?: boolean;
}

// ── the client-token surface (Prism's MerchantAuthenticationClient) — browser-confirmable sessions ────────────────────

/**
 * A browser-confirmable session: the server creates the intent, the browser SDK confirms it with `clientSecret`, so raw
 * card data never touches the server (PCI-scope reduction). Crediting lands on the processor webhook, not the create
 * call. This is the piece a pure server-side `authorize` can't express — the Payment-Element / one-click / add-card flows.
 */
export interface ClientSession {
  /** the token the browser SDK confirms with — Stripe's `client_secret`; another processor's equivalent. */
  clientSecret: string;
  connectorTransactionId?: string;
  customerId?: string;
}

/** Create a PAYMENT session to confirm in-browser. Omit `paymentMethod` for a Payment-Element flow (the browser collects
 *  the card); pass a saved `paymentMethod` token for a one-click charge on a saved card. */
export interface CreatePaymentSessionRequest {
  amount: MinorAmount;
  customerId?: string;
  /** pin the charge to a saved instrument (one-click); omit to let the browser collect one (Payment Element). */
  paymentMethod?: Secret;
  captureMethod?: CaptureMethod;
  /** save the collected card for later off-session use. */
  setupFutureUsage?: boolean;
  metadata?: Record<string, string>;
}

/** Create a SETUP session to vault a card without charging ("add card"). */
export interface CreateSetupSessionRequest {
  customerId: string;
  metadata?: Record<string, string>;
}
