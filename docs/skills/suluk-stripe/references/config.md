# Configuration

## VerifyOptions

### Properties

#### now

current unix seconds (default `Date.now()/1000`) — injectable for tests + replay-window tuning.

**Type:** `() => number`

#### toleranceSec

reject events whose timestamp is older than this many seconds (default 300 — Stripe's window).

**Type:** `number`

## StripeConfig

The low-level Stripe HTTP transport (C048) — the fetch-based Stripe client the stripeConnector rides, exported
so an app's Stripe-PLATFORM operations (hosted Checkout, subscriptions, saved-card management, Tax — the things the
agnostic PaymentConnector deliberately doesn't model) ride the SAME client instead of a separate legacy one. This is
intentionally Stripe-specific: agnostic payment FLOWS go through the connector, these platform ops through this
transport — one Stripe roof, no accidental second path. Workers-native (fetch + x-www-form-urlencoded), zero deps.

### Properties

#### secretKey

**Type:** `string`

**Required:** yes

#### fetch

the HTTP transport — a mock in tests; defaults to the global `fetch` in prod.

**Type:** `typeof fetch`