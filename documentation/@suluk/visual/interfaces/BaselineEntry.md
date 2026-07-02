[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/visual](../README.md) / BaselineEntry

# Interface: BaselineEntry

Defined in: [baseline.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/visual/src/baseline.ts#L24)

`@suluk/visual` — pixel-confidence by construction.

Verify each UI PRIMITIVE's pixels ONCE (render it in isolation, screenshot it, approve it). The approval is
recorded against the primitive's content hash. Thereafter, every generated UI is pixel-confident *without a
new screenshot* iff all its primitives are approved + unchanged — checked by hashing, not rendering. A
primitive is re-verified only when ITS source changes (the hash drifts). Confidence propagates up the
component → block → section → page tiers exactly like the rest of Suluk: verify the source once, trust the
deterministic projection. CANDIDATE tooling — NOT official OAS.

## Properties

### approvedAt

> **approvedAt**: `number`

Defined in: [baseline.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/visual/src/baseline.ts#L31)

Wall-clock ms of approval (an input — pass it in, so the baseline is reproducible).

***

### contentHash

> **contentHash**: `string`

Defined in: [baseline.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/visual/src/baseline.ts#L27)

Content hash of the source that produced the approved pixels.

***

### key

> **key**: `string`

Defined in: [baseline.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/visual/src/baseline.ts#L25)

***

### label?

> `optional` **label?**: `string`

Defined in: [baseline.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/visual/src/baseline.ts#L32)

***

### snapshotHash

> **snapshotHash**: `string`

Defined in: [baseline.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/visual/src/baseline.ts#L29)

Hash of the approved screenshot (set by the verify-once gate).
