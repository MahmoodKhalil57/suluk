[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/testgen](../README.md) / MoneyTestsOptions

# Interface: MoneyTestsOptions

Defined in: [money.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/testgen/src/money.ts#L15)

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

## Properties

### framework?

> `optional` **framework?**: `"bun"` \| `"vitest"`

Defined in: [money.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/testgen/src/money.ts#L17)

which runner's imports to emit (both share test/expect/describe). Default "bun".

***

### stripeModule?

> `optional` **stripeModule?**: `string`

Defined in: [money.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/testgen/src/money.ts#L19)

the import specifier for the pricing primitives. Default "@suluk/payments".
