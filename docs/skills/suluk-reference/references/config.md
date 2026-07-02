# Configuration

## ReferenceOptions

### Properties

#### pageTitle

**Type:** `string`

#### tagline

**Type:** `string`

#### viewers

**Type:** `Viewer[]`

#### costLedgerUrl

a same-origin URL returning the cost ledger (with opStats) → live declared-vs-actual cost drift.

**Type:** `string`

#### tryIt

enable the in-page try-it executor (same-origin fetch). Default true.

**Type:** `boolean`

#### whoamiUrl

a same-origin URL returning `{ viewer: "<id>" }` for the CURRENT session → the renderer auto-selects that
viewer's lens (the council-ratified L2 "live per-user view") and re-checks on focus. The full canonical document
is ALWAYS the source + always escapable via "Everything" — the projection is a client-side legible subset.

**Type:** `string`

#### sdkUrl

a URL serving a generated TypeScript SDK (@suluk/sdk) → a prominent "Download SDK" affordance.

**Type:** `string`

#### conformanceUrl

a URL serving a generated conformance suite (@suluk/testgen) → a "Download conformance tests" affordance.

**Type:** `string`

#### plugins

**Type:** `ReferencePlugin[]`

## PortalOptions

### Properties

#### pageTitle

**Type:** `string`

#### tagline

**Type:** `string`