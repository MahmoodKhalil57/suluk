# Configuration

## TestgenOptions

`@suluk/testgen` — generate a DETERMINISTIC conformance test suite from a v4 "Suluk" contract. The contract's
claims made executable: the server ENFORCES x-suluk-access on the wire, declared statuses hold, 2xx bodies
conform to their schemas, declared costs are well-formed. A pure function of the document. CANDIDATE tooling.

### Properties

#### baseURL

the deployment under test; the generated suite reads SULUK_BASE_URL first, then falls back to this.

**Type:** `string`

#### framework

which test runner's imports to emit (both share the test/expect/describe API). Default "bun".

**Type:** `"bun" | "vitest"`

## MoneyTestsOptions

generateMoneyTests — PARITY §2 "Checkout & E-commerce Resilience" made an EXECUTABLE, in-process conformance
suite over the @suluk/payments pricing primitives (saastarter-parity Phase 0). Unlike the wire conformance suite,
the money invariants are properties of the SHARED, app-independent primitives (there is nothing in a v4 document
to walk for verifyAmount) — so this is a separate emitter that produces a self-contained `bun test` file an app
commits + runs. No network, no app coupling, no document input.

Provenance note (honesty, adopt-by-receipt): the anti-tampering + integer-cents + never-over-discount invariants
are faithful encodings of saastarter's checkout intent. The exact-sum proration + deterministic-idempotency
invariants are STRONGER than saastarter's actual code (PARITY records a real cart/order proration drift bug and
an ad-hoc retry path) — they assert what @suluk/payments was authored to GUARANTEE, an origination inspired by the
parity goal, not a behavioral port. The generated header says so.

### Properties

#### framework

which runner's imports to emit (both share test/expect/describe). Default "bun".

**Type:** `"bun" | "vitest"`

#### stripeModule

the import specifier for the pricing primitives. Default "@suluk/payments".

**Type:** `string`