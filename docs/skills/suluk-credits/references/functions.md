# Functions

## credits

### `getBalance`
Current balance = sum of all ledger deltas for the user.
```ts
getBalance(db: CreditsDB, userId: string): Promise<number>
```
**Parameters:**
- `db: CreditsDB`
- `userId: string`
**Returns:** `Promise<number>`

### `record`
Append one ledger row (the single writer); returns the new row id. `delta` is + on grant/top-up, − on debit.
```ts
record(db: CreditsDB, userId: string, delta: number, reason: string): Promise<string>
```
**Parameters:**
- `db: CreditsDB`
- `userId: string`
- `delta: number`
- `reason: string`
**Returns:** `Promise<string>`

### `recordKey`
Attribute a debit row to the API KEY that spent it (per-key usage + limit join). Best-effort + idempotent (PK on
 txnId) — attribution is reporting, NOT the money path, so a failure here must never break the debit it rode in on.
```ts
recordKey(db: CreditsDB, txnId: string, keyId: string | null | undefined): Promise<void>
```
**Parameters:**
- `db: CreditsDB`
- `txnId: string`
- `keyId: string | null | undefined`
**Returns:** `Promise<void>`

### `debitIfCovers`
ATOMIC metered debit — append `-amount` ONLY IF the balance still covers it, in ONE conditional INSERT (atomic on both
bun:sqlite and D1), then best-effort attribute it. Returns true when debited, false when the balance raced below the
cost. Closes the read-then-write window where K concurrent charges each read the same balance, all pass `cost <=
balance`, and all append — driving the ledger NEGATIVE. The self-guard rejects a non-positive/non-integer `amount`
(a negative would compute delta=+amount and trivially pass the WHERE, MINTING credits).
```ts
debitIfCovers(db: CreditsDB, userId: string, amount: number, reason: string, keyId?: string | null): Promise<boolean>
```
**Parameters:**
- `db: CreditsDB`
- `userId: string`
- `amount: number`
- `reason: string`
- `keyId: string | null` (optional)
**Returns:** `Promise<boolean>`

### `keySpend`
Total credits a key has spent — SUM(abs(delta)) over its attributed DEBITS (delta < 0). Drives the per-key cap + the
 keys-page usage column.
```ts
keySpend(db: CreditsDB, keyId: string): Promise<number>
```
**Parameters:**
- `db: CreditsDB`
- `keyId: string`
**Returns:** `Promise<number>`

### `nonceFor`
The DETERMINISTIC ledger row id an idempotent operation maps to — exported so a caller can pre-check existence at the
 SAME id debitOnceIfCovers will use, without re-deriving the format and risking drift.
```ts
nonceFor(reason: string, idemKey: string): string
```
**Parameters:**
- `reason: string`
- `idemKey: string`
**Returns:** `string`

### `debitOnceIfCovers`
Idempotent atomic debit: debit `amount` ONLY if the balance covers it AND this exact logical operation (identified by
`idemKey`) hasn't already been debited. The row id is DERIVED from the key (`${reason}:${idemKey}`), so a retry/duplicate
collides on the primary key and is IGNORED — it can never mint a second debit. The money-OUT double-spend guard a
per-call random nonce lacks for PARTIAL refunds. One statement (INSERT OR IGNORE … WHERE SUM(delta) >= amount), atomic
on both engines. Returns `debited` (fresh — `nonce` anchors the downstream Stripe idempotency key), `replayed` (already
debited — caller MUST NOT move money again), or `insufficient` (balance no longer covers it).
```ts
debitOnceIfCovers(db: CreditsDB, userId: string, amount: number, reason: string, idemKey: string): Promise<DebitOutcome>
```
**Parameters:**
- `db: CreditsDB`
- `userId: string`
- `amount: number`
- `reason: string`
- `idemKey: string`
**Returns:** `Promise<DebitOutcome>`

### `debitOnceAttributed`
Idempotent debit + per-key ATTRIBUTION — the money primitive a per-item bulk charge needs (debitOnceIfCovers
itself does NOT attribute). On a FRESH `debited` it records the spend against `keyId` (the row id is the stable nonce);
a `replayed`/`insufficient` attributes nothing.
```ts
debitOnceAttributed(db: CreditsDB, userId: string, amount: number, reason: string, idemKey: string, keyId?: string | null): Promise<DebitOutcome>
```
**Parameters:**
- `db: CreditsDB`
- `userId: string`
- `amount: number`
- `reason: string`
- `idemKey: string`
- `keyId: string | null` (optional)
**Returns:** `Promise<DebitOutcome>`

### `ledgerRow`
The signed credit `delta` + recorded `amountCents` for ONE ledger row id, or null if absent. Lets an idempotent replay
 report the ORIGINAL operation's amounts — never the retry's (possibly tampered) request.
```ts
ledgerRow(db: CreditsDB, id: string): Promise<{ delta: number; amountCents: number | null } | null>
```
**Parameters:**
- `db: CreditsDB`
- `id: string`
**Returns:** `Promise<{ delta: number; amountCents: number | null } | null>`

### `recordAmount`
Annotate a ledger row with the CASH that moved (signed). Idempotent (PK on txnId), best-effort (purely cosmetic). No-op on 0/null.
```ts
recordAmount(db: CreditsDB, txnId: string, amountCents: number | null | undefined): Promise<void>
```
**Parameters:**
- `db: CreditsDB`
- `txnId: string`
- `amountCents: number | null | undefined`
**Returns:** `Promise<void>`

### `listTransactions`
The user's recent ledger rows (grants + debits) with the cash that moved, newest first — the "recent transactions" +
 the activity log. `limit` is generous (effectively "all" for a normal account).
```ts
listTransactions(db: CreditsDB, userId: string, limit: number): Promise<LedgerEntry[]>
```
**Parameters:**
- `db: CreditsDB`
- `userId: string`
- `limit: number` — default: `250`
**Returns:** `Promise<LedgerEntry[]>`

### `ledgerStats`
Aggregate ledger stats (granted vs spent, outstanding) — the generic part of an admin dashboard. The user COUNT is the
 app's (it owns the user table); compose it on top.
```ts
ledgerStats(db: CreditsDB): Promise<LedgerStats>
```
**Parameters:**
- `db: CreditsDB`
**Returns:** `Promise<LedgerStats>`

### `grantOnce`
Idempotent money-IN grant — credit `amount` exactly once, keyed on the ledger row id `idemKey` (a STABLE per-payment
anchor: `pi:<id>` / `inv:<id>` / `cs:<id>`), so a webhook redelivery or dashboard "Resend" can NEVER double-credit. The
money-IN twin of debitOnceIfCovers (which guards money-OUT). `legacyKey`, when given, is an ADDITIONAL anchor
honoured: if a row already exists under it the money is already credited and we skip — so MOVING the idempotency key
across a deploy (e.g. event-id → session-id) can't re-grant an in-flight payment. This is the LEDGER-INTEGRITY
chokepoint for every grant: it rejects a non-finite / non-integer / non-positive delta, so an upstream
`Number(metadata.credits)` can never let "Infinity" (which would poison every later balance read) or "500.9" (which
would break balance == SUM(int delta)) reach the ledger. Returns true ONLY on a FRESH grant; on a fresh grant the cash
`amountCents` (when given) is annotated for the $ detail. Use this for Stripe webhook crediting (top-up / subscription).
```ts
grantOnce(db: CreditsDB, userId: string, amount: number, idemKey: string, reason: string, amountCents?: number | null, legacyKey?: string): Promise<boolean>
```
**Parameters:**
- `db: CreditsDB`
- `userId: string`
- `amount: number`
- `idemKey: string`
- `reason: string` — default: `"grant"`
- `amountCents: number | null` (optional)
- `legacyKey: string` (optional)
**Returns:** `Promise<boolean>`

### `addCredits`
Grant/top-up credits. Returns the new balance.
```ts
addCredits(db: CreditsDB, userId: string, amount: number, reason: string): Promise<number>
```
**Parameters:**
- `db: CreditsDB`
- `userId: string`
- `amount: number`
- `reason: string`
**Returns:** `Promise<number>`

### `debitCredits`
Debit credits if the balance covers it; throws InsufficientCreditsError otherwise. Returns the new balance.
NOTE: read-then-write — fine at low concurrency; use debitIfCovers for the concurrency-safe atomic path.
```ts
debitCredits(db: CreditsDB, userId: string, amount: number, reason: string): Promise<number>
```
**Parameters:**
- `db: CreditsDB`
- `userId: string`
- `amount: number`
- `reason: string`
**Returns:** `Promise<number>`
