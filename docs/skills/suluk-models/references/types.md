# Types & Enums

## types

### `Tier`
`@suluk/models` — the catalog schema (council wf_729cde52-cc7). A row is keyed BY MODEL (id, capabilities, benchmark
tiers, context window — all per-model). Per-ENDPOINT axes (price/region/data-retention/latency, which differ across
the provider endpoints one model fans out to) belong in a future optional `endpoints[]` sub-list (keying micro-panel
wf_27de1bec-a42: model-keyed HYBRID, @0.6 — RESERVED, not built: OpenRouter routes endpoints at runtime + honors ZDR
via a request flag, and no fleet needs per-endpoint region governance yet). NB until then `gov.region`/`dataRetention`
are per-MODEL and stay UNKNOWN (fail-closed) — do NOT populate a "representative" region (it would silently degrade
fail-closed to fail-OPEN at the endpoint layer — a forged in-region attestation; see C030).
Decidable OpenRouter facts are NUMBERS/BOOLS; noisy third-party benchmarks are COARSE TIERS (frontier/strong/mid/basic/
unknown) — never a 2-decimal score (that launders noisy/contaminated public data as precision). Every cell carries
{source, asOf}; an unsourced cell is MISSING, never a confident value, and a missing tier is NEVER imputed to
worst (that would kill new models). The catalog stores NO cross-axis composite — blending is the selector's job
at query time under explicit operator weights (storing a blend launders preference as fact).
```ts
"frontier" | "strong" | "mid" | "basic" | "unknown"
```

### `Cell`
One catalog value with provenance. `value: null` ⇒ UNKNOWN (and `source` is ""); never imputed.
**Properties:**
- `value: T | null`
- `source: string`
- `asOf: string`

### `DataRetention`
```ts
"zero" | "ephemeral" | "logged" | "trains" | "unknown"
```

### `ModelRecord`
**Properties:**
- `id: string` — the OpenRouter id the selector compiles against (stable wire id).
- `provider: string`
- `family: string`
- `status: "active" | "deprecated" | "sunset" | "preview"`
- `cost: { inputPerMtok: Cell<number>; outputPerMtok: Cell<number>; cachedInputPerMtok: Cell<number>; perRequest: Cell<boolean> }`
- `context: { maxWindow: Cell<number>; maxOutput: Cell<number>; longCtxFidelity: Cell<Tier> }`
- `speed: { ttft: Cell<Tier>; throughput: Cell<Tier> }` — Artificial-Analysis single-vendor, provider/route/load-dependent — their measurement, not a guarantee.
- `caps: { toolCalling: Cell<boolean>; forcedToolChoice: Cell<boolean>; parallelToolCalls: Cell<boolean>; structuredOutput: Cell<boolean>; jsonSchemaStrict: Cell<boolean>; inputModalities: Cell<string[]>; outputModalities: Cell<string[]> }` — capabilities are DECLARED-not-verified (provider self-report; we do not self-test).
- `intel: { agenticToolUse: Cell<Tier>; instructionFollowing: Cell<Tier>; reasoning: Cell<Tier>; coding: Cell<Tier>; longCtxComprehension: Cell<Tier>; knowledge: Cell<Tier>; humanPreference: Cell<Tier> }` — "intelligence" split into 6 orthogonal-ish, source-separated dimensions (ranked by relevance to tool-using agents).
- `gov: { dataRetention: Cell<DataRetention>; region: Cell<string>; license: Cell<string> }`
- `ops: { providerFanOut: Cell<number>; popularityRank: Cell<number>; releaseDate: Cell<string>; priceVolatile: Cell<boolean> }`

### `ModelCatalog`
**Properties:**
- `schemaVersion: string`
- `generatedAt: string`
- `snapshotHash: string` — content-addressed so a selection is reproducible week-over-week (ties C027 contentHash).
- `rows: ModelRecord[]`

### `HardFilters`
Hard requirements — these FILTER (can empty the set ⇒ fail-loud), never rank.
**Properties:**
- `needsTools: boolean` (optional)
- `needsForcedToolChoice: boolean` (optional)
- `needsStructured: boolean` (optional)
- `strictSchema: boolean` (optional)
- `inputModalities: string[]` (optional)
- `outputModalities: string[]` (optional)
- `minWindowRequired: number` (optional) — the analyzer's per-agent minWindowRequired (context.ts) becomes the hard min-context gate.
- `minOutputTokens: number` (optional)
- `fidelityFloor: Tier` (optional)
- `maxInputPrice: number` (optional)
- `maxOutputPrice: number` (optional)
- `policy: { modelAllowlist?: string[]; allowedRegions?: string[]; allowedLicenses?: string[]; allowedRetention?: DataRetention[] }` (optional) — C028 governance/allowlist — the TERMINAL, non-overridable MEET (a preference can NEVER widen these).

### `Profile`
```ts
"tool-reliable" | "cheap-fast" | "balanced" | "max-reasoning" | "long-context" | "vision"
```

### `Preferences`
Preference — RANKS the survivors. A named profile is the 90% case; the escape hatch is ≤4 small int weights.
**Properties:**
- `profile: Profile` (optional)
- `prefer: { intelligence?: 0 | 1 | 2 | 3; cost?: 0 | 1 | 2 | 3; speed?: 0 | 1 | 2 | 3; context?: 0 | 1 | 2 | 3 }` (optional)
- `taskShape: "agentic" | "coding" | "reasoning"` (optional) — routes the single "intelligence" knob to the ONE relevant INTEL sub-tier.

### `RankedModel`
**Properties:**
- `id: string`
- `provider: string`
- `score: number`
- `why: { passedFilters: string[]; decidingPreference: string; tierByAxis: Record<string, { tier: Tier | string; source: string; asOf: string }> }`

### `SelectResult`
**Properties:**
- `ranked: RankedModel[]` — ranked best-first; empty when no model satisfies the hard filters.
- `candidateCount: number` — the count after hard filtering.
- `unsatisfiable: string[]` (optional) — present when the requirements emptied the set — names the unsatisfiable filter(s).
- `coverageGaps: string[]` — UNKNOWN-coverage warning: soft axes with no data on the winner (honesty surface).

## profiles

### `ResolvedProfile`
**Properties:**
- `prefer: { intelligence: 0 | 1 | 2 | 3; cost: 0 | 1 | 2 | 3; speed: 0 | 1 | 2 | 3; context: 0 | 1 | 2 | 3 }`
- `taskShape: "agentic" | "coding" | "reasoning"` (optional)
- `impliedFilters: Partial<HardFilters>` — filters the profile auto-wires (an author choosing "tool-reliable" implicitly requires tool-calling).

## bucketing

### `AxisRule`
**Properties:**
- `source: string` — the public leaderboard(s) this axis is bucketed from (cited in every cell's `source`).
- `metric: string` — what the score means (so a reviewer can reproduce the bucketing).
- `boundaries: { frontier: number; strong: number; mid: number }` — score >= frontier ⇒ frontier; >= strong ⇒ strong; >= mid ⇒ mid; else basic.

## normalize

### `ORModel`
The subset of an OpenRouter `/models` row we rely on (all public facts).
**Properties:**
- `id: string`
- `name: string` (optional)
- `created: number` (optional)
- `context_length: number` (optional)
- `pricing: { prompt?: string; completion?: string; request?: string; input_cache_read?: string }` (optional)
- `top_provider: { max_completion_tokens?: number | null }` (optional)
- `architecture: { input_modalities?: string[]; output_modalities?: string[] }` (optional)
- `supported_parameters: string[]` (optional)

## overlay

### `IntelAxis`
```ts
"agenticToolUse" | "instructionFollowing" | "reasoning" | "coding" | "longCtxComprehension" | "knowledge" | "humanPreference"
```
