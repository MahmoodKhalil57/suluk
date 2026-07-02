# Functions

## baseline

### `hash`
Stable, fast, non-cryptographic hash (djb2) of source text or raw bytes — for change detection only.
```ts
hash(input: string | Uint8Array<ArrayBufferLike>): string
```
**Parameters:**
- `input: string | Uint8Array<ArrayBufferLike>`
**Returns:** `string`

### `checkConfidence`
Decide, WITHOUT rendering, whether a UI built from `used` primitives is pixel-confident given the baseline.
```ts
checkConfidence(used: readonly UsedPrimitive[], baseline: Baseline): ConfidenceReport
```
**Parameters:**
- `used: readonly UsedPrimitive[]`
- `baseline: Baseline`
**Returns:** `ConfidenceReport`

### `pendingVerification`
Exactly the primitives that need a (one-time) pixel verification right now: the missing + the drifted.
```ts
pendingVerification(used: readonly UsedPrimitive[], baseline: Baseline): UsedPrimitive[]
```
**Parameters:**
- `used: readonly UsedPrimitive[]`
- `baseline: Baseline`
**Returns:** `UsedPrimitive[]`

### `approve`
Record approvals into the baseline (the "verify once"): each capture marks its primitive verified-at-hash.
```ts
approve(captures: readonly Capture[], baseline: Baseline, at: number): Baseline
```
**Parameters:**
- `captures: readonly Capture[]`
- `baseline: Baseline`
- `at: number`
**Returns:** `Baseline`

### `confidenceCoverage`
Coverage = fraction of used primitives that are approved + unchanged. 1 ⇒ fully pixel-confident.
```ts
confidenceCoverage(used: readonly UsedPrimitive[], baseline: Baseline): number
```
**Parameters:**
- `used: readonly UsedPrimitive[]`
- `baseline: Baseline`
**Returns:** `number`

## shadcn

### `formPrimitives`
The distinct primitives a generated FORM is composed of: its layout + each widget it uses.
```ts
formPrimitives(spec: FormSpec, sources: PrimitiveSources): UsedPrimitive[]
```
**Parameters:**
- `spec: FormSpec`
- `sources: PrimitiveSources`
**Returns:** `UsedPrimitive[]`

### `tablePrimitives`
The distinct primitives a generated TABLE is composed of: its layout + the cell primitive.
```ts
tablePrimitives(spec: TableSpec, sources: PrimitiveSources): UsedPrimitive[]
```
**Parameters:**
- `spec: TableSpec`
- `sources: PrimitiveSources`
**Returns:** `UsedPrimitive[]`

## capture

### `renderPrimitiveHtml`
A self-contained HTML page that renders exactly one primitive — the thing you screenshot to approve it.
```ts
renderPrimitiveHtml(opts: { widget: string; css?: string }): string
```
**Parameters:**
- `opts: { widget: string; css?: string }`
**Returns:** `string`

### `knownWidgets`
The widget primitives this package knows how to render in isolation (for the verify-once gate).
```ts
knownWidgets(): string[]
```
**Returns:** `string[]`

### `primitiveControl`
Just the control fragment (no surrounding page) — for an inline preview in a host UI (the cockpit webview).
```ts
primitiveControl(widget: string): string
```
**Parameters:**
- `widget: string`
**Returns:** `string`

### `primitiveCss`
A small stylesheet for the control fragments above — so a host can render `primitiveControl` inline.
```ts
primitiveCss(): string
```
**Returns:** `string`
