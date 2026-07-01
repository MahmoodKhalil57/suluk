# C48. Provider-agnostic payments — reimplement the Hyperswitch Prism interface; deprecate `@suluk/stripe`

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced: *"I want to use
> [hyperswitch-prism](https://github.com/juspay/hyperswitch-prism) mainly from now on, implement it instead of a Stripe
> broker, and in billing, and deprecate @suluk/stripe in favor of a more agnostic solution"* — then, on learning Prism
> can't run on the edge: *"if we can't run it we should use and reimplement their interfaces to stay agnostic and be able
> to add and switch payment providers easily and stay light."* Operator chose **ADR + interface first**.

Date: 2026-07-01

## Status

Accepted; **interface BUILT + witnessed**, implementations DEFERRED (operator: "ADR + interface first"). Decision ceiling
**0.5** (design) / **0.55** (the interface, unit-witnessed). Ledger:
[`0payments.bn`](../../../plan/facts/0payments.bn) (burhan True, converge clean). **Not a contract-facet change** — an
app-runtime library; never touches `buildAda`/`matchRequest`. Supersedes the payment surface of C046's `@suluk/billing`.

## Context — the finding that shaped the decision

[Hyperswitch Prism](https://github.com/juspay/hyperswitch-prism) is a **stateless, unified connector library**: one
request schema (`authorize`/`capture`/`refund`/`void`/`sync`, plus customer/tokenize/recurring/webhook clients) across
100+ processors; switch Stripe→Adyen by changing a `connectorConfig` block. Exactly the agnosticism we want.

**But Prism can't run where our billing runs.** The Node SDK is a **native FFI addon** — `koffi` bindings →
`connector-service-ffi.node` → a compiled Rust core (Node 18+, platform binaries). Cloudflare Workers (V8 isolates) forbid
native modules, and `@suluk/billing` is Workers-native. So billing **cannot** `import 'hyperswitch-prism'`. The options
were: (a) run Prism as a sidecar service the Worker calls; (b) an agnostic seam with a Prism backend for Node + a
fetch backend for the edge; (c) move billing off the edge. The operator chose a fourth, lighter path: **adopt Prism's
INTERFACE and reimplement it in TypeScript over `fetch`** — Workers-native, zero native deps, no sidecar. We keep the
agnosticism (and integer-exact status semantics, so a real Prism backend stays swappable) without Prism's runtime.

## Decision

A new package **`@suluk/payments`** — a Workers-native TS reimplementation of the Prism interface:

- **The unified schema** ([`types.ts`](../../../tooling/ts/packages/payments/src/types.ts)) — `AuthorizeRequest` /
  `PaymentResponse` / capture / void / refund / sync, `MinorAmount`, `PaymentMethod` (card | token), `Secret<T>` wrapping
  (PCI-scope signal). `PaymentStatus` + `RefundStatus` carry **Prism's exact integer values** (`CHARGED = 8`,
  `AUTHORIZED = 6`, `FAILURE = 21`, `REFUND_SUCCESS = 4`, …) so connector semantics match and a real Prism backend drops
  in later. A soft decline is **in-band `FAILURE`**, never thrown.
- **The seam** ([`connector.ts`](../../../tooling/ts/packages/payments/src/connector.ts)) — `PaymentConnector` (core
  flows required; customer/tokenize/recurring/webhook optional per-connector), and the Prism-style
  `paymentClient(config, registry)` where **the config names the processor** — switch by config, not code. Connectors are
  `fetch`-based (`HttpOptions.fetch` is the mockable transport).
- **Errors** ([`errors.ts`](../../../tooling/ts/packages/payments/src/errors.ts)) — `IntegrationError` /
  `ConnectorError` / `NetworkError`, mirroring Prism's hard-failure split.
- **A mock connector** ([`mock.ts`](../../../tooling/ts/packages/payments/src/mock.ts)) — proves the seam + a local/test
  stand-in (decline card → in-band FAILURE; 3DS card → AUTHENTICATION_PENDING; auto/manual → CHARGED/AUTHORIZED).

Witnessed: **payments 7 pass** — integer-exact enums, config-selects-connector (+ the zero/many/unknown IntegrationError
guards), the full auto/manual/void/refund/sync flow, in-band decline, 3DS redirection. Zero deps, tsc clean.

## Consequences / honesty

- **Interface first — real connectors are the follow-on.** `mockConnector` proves the shape; a `stripeConnector`
  (fetch → Stripe REST, unified in/out) is the first real backend, then others. Each is money-critical → witnessed against
  the processor's test mode before it carries live traffic.
- **`@suluk/stripe` deprecation is a MIGRATION, not a delete.** It's deeply woven into billing (checkout, subscriptions,
  the webhook dispatch, pricing) and money-critical. The path: build the agnostic connectors → move billing call-by-call
  behind `@suluk/payments` (parity-tested against `@suluk/stripe`) → flip the default → mark `@suluk/stripe` deprecated.
  **We do NOT touch `@suluk/stripe` yet** — deprecating it before the replacement is proven would strand the live money
  path.
- **The provision "payment connector" broker (C047) replaces the planned "stripe broker"** — and is THIN: Prism/our
  interface is stateless (no product/price/webhook-endpoint management), so the broker validates/registers a
  `connectorConfig`, it doesn't provision Stripe products. Deferred with the connectors.
- **Coverage gaps to close in billing, not the library.** Prism is payment-flow-only (no subscription *plan/price*
  management, no product catalog). Billing's pricing matrix + subscription-plan logic stay app-side (as C046 already
  scoped); the library handles the charge/refund/mandate flows.

## Deferred (post-approval)

Real connectors (`stripe` first, then adyen/…); the `@suluk/billing` rewire behind `@suluk/payments` (parity-tested); the
C047 payment-connector broker; the eventual `@suluk/stripe` deprecation notice + removal.
