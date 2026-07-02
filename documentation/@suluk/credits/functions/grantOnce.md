[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / grantOnce

# Function: grantOnce()

> **grantOnce**(`db`, `userId`, `amount`, `idemKey`, `reason?`, `amountCents?`, `legacyKey?`): `Promise`\<`boolean`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:204](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/credits/src/credits.ts#L204)

Idempotent money-IN grant — credit `amount` exactly once, keyed on the ledger row id `idemKey` (a STABLE per-payment
anchor: `pi:<id>` / `inv:<id>` / `cs:<id>`), so a webhook redelivery or dashboard "Resend" can NEVER double-credit. The
money-IN twin of [debitOnceIfCovers](debitOnceIfCovers.md) (which guards money-OUT). `legacyKey`, when given, is an ADDITIONAL anchor
honoured: if a row already exists under it the money is already credited and we skip — so MOVING the idempotency key
across a deploy (e.g. event-id → session-id) can't re-grant an in-flight payment. This is the LEDGER-INTEGRITY
chokepoint for every grant: it rejects a non-finite / non-integer / non-positive delta, so an upstream
`Number(metadata.credits)` can never let "Infinity" (which would poison every later balance read) or "500.9" (which
would break balance == SUM(int delta)) reach the ledger. Returns true ONLY on a FRESH grant; on a fresh grant the cash
`amountCents` (when given) is annotated for the $ detail. Use this for Stripe webhook crediting (top-up / subscription).

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### userId

`string`

### amount

`number`

### idemKey

`string`

### reason?

`string` = `"grant"`

### amountCents?

`number` \| `null`

### legacyKey?

`string`

## Returns

`Promise`\<`boolean`\>
