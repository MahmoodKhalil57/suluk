# Types & Enums

## baseline

### `Baseline`
The approved baseline — primitive key → its verified entry. Persist as JSON; commit it.
```ts
Record<string, BaselineEntry>
```

### `BaselineEntry`
`@suluk/visual` — pixel-confidence by construction.

Verify each UI PRIMITIVE's pixels ONCE (render it in isolation, screenshot it, approve it). The approval is
recorded against the primitive's content hash. Thereafter, every generated UI is pixel-confident *without a
new screenshot* iff all its primitives are approved + unchanged — checked by hashing, not rendering. A
primitive is re-verified only when ITS source changes (the hash drifts). Confidence propagates up the
component → block → section → page tiers exactly like the rest of Suluk: verify the source once, trust the
deterministic projection. CANDIDATE tooling — NOT official OAS.
**Properties:**
- `key: string`
- `contentHash: string` — Content hash of the source that produced the approved pixels.
- `snapshotHash: string` — Hash of the approved screenshot (set by the verify-once gate).
- `approvedAt: number` — Wall-clock ms of approval (an input — pass it in, so the baseline is reproducible).
- `label: string` (optional)

### `UsedPrimitive`
A primitive USED by a generated UI: its key + the CURRENT content hash of its source.
**Properties:**
- `key: string`
- `contentHash: string`
- `label: string` (optional)

### `ConfidenceReport`
`@suluk/visual` — pixel-confidence by construction.

Verify each UI PRIMITIVE's pixels ONCE (render it in isolation, screenshot it, approve it). The approval is
recorded against the primitive's content hash. Thereafter, every generated UI is pixel-confident *without a
new screenshot* iff all its primitives are approved + unchanged — checked by hashing, not rendering. A
primitive is re-verified only when ITS source changes (the hash drifts). Confidence propagates up the
component → block → section → page tiers exactly like the rest of Suluk: verify the source once, trust the
deterministic projection. CANDIDATE tooling — NOT official OAS.
**Properties:**
- `confident: boolean` — True ⇒ every used primitive is approved + unchanged → the UI is pixel-confident without a new screenshot.
- `approved: string[]` — Used primitives that are approved at the current content hash.
- `missing: UsedPrimitive[]` — Used primitives never pixel-verified — must be verified once.
- `drifted: UsedPrimitive[]` — Used primitives approved BEFORE but whose source changed (hash drifted) — must be re-verified.

### `Capture`
A capture from the verify-once gate: the primitive, its content hash, and its approved screenshot's hash.
**Properties:**
- `key: string`
- `contentHash: string`
- `snapshotHash: string`
- `label: string` (optional)

## shadcn

### `PrimitiveSources`
**Properties:**
- `widgets: Record<string, string>` — widget name (text/number/select/switch/…) → the source of its UI component (the bytes that draw pixels).
- `formLayout: string` (optional) — The form renderer/layout source — so changing the form's arrangement re-verifies the composition.
- `tableLayout: string` (optional) — The table renderer/layout source.
