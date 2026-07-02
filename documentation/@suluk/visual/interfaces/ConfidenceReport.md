[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/visual](../README.md) / ConfidenceReport

# Interface: ConfidenceReport

Defined in: [baseline.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/visual/src/baseline.ts#L45)

`@suluk/visual` — pixel-confidence by construction.

Verify each UI PRIMITIVE's pixels ONCE (render it in isolation, screenshot it, approve it). The approval is
recorded against the primitive's content hash. Thereafter, every generated UI is pixel-confident *without a
new screenshot* iff all its primitives are approved + unchanged — checked by hashing, not rendering. A
primitive is re-verified only when ITS source changes (the hash drifts). Confidence propagates up the
component → block → section → page tiers exactly like the rest of Suluk: verify the source once, trust the
deterministic projection. CANDIDATE tooling — NOT official OAS.

## Properties

### approved

> **approved**: `string`[]

Defined in: [baseline.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/visual/src/baseline.ts#L49)

Used primitives that are approved at the current content hash.

***

### confident

> **confident**: `boolean`

Defined in: [baseline.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/visual/src/baseline.ts#L47)

True ⇒ every used primitive is approved + unchanged → the UI is pixel-confident without a new screenshot.

***

### drifted

> **drifted**: [`UsedPrimitive`](UsedPrimitive.md)[]

Defined in: [baseline.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/visual/src/baseline.ts#L53)

Used primitives approved BEFORE but whose source changed (hash drifted) — must be re-verified.

***

### missing

> **missing**: [`UsedPrimitive`](UsedPrimitive.md)[]

Defined in: [baseline.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/visual/src/baseline.ts#L51)

Used primitives never pixel-verified — must be verified once.
