# Types & Enums

## logs.service

### `LogEntry`
**Properties:**
- `id: string`
- `userId: string | null`
- `action: string`
- `detail: unknown`
- `createdAt: number`

### `LogQuery`
A small, SAFE filter over the activity log (the Activity/query surface). A CLOSED whitelist of fields — `userId`
(exact), `action` (exact, or `~substring` via a leading `~`), `since` (createdAt >= a ms epoch) — every value compiled
to a BOUND drizzle parameter (the `${value}` helpers), so user text NEVER reaches SQL as text. Mirrors the oracle
(`logquery.ts`) discipline; adapted to `activity_log`'s columns. Same shape the query route composes from ?params.
**Properties:**
- `userId: string` (optional)
- `action: string` (optional) — exact match, unless prefixed with `~` → a case-sensitive substring match on the action string.
- `since: number` (optional) — lower bound on `createdAt`, as a ms-since-epoch number (inclusive).
- `limit: number` (optional)

### `LogBucket`
One bucket of a coarse action-count timeseries (count of matching rows per distinct `action`).
**Properties:**
- `action: string`
- `count: number`
