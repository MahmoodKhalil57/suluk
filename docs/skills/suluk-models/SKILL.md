---
description: "A weekly, PUBLIC-DATA-ONLY catalog of OpenRouter models + a selector: a suluk skill declares NEEDS (hard filters) + a small PREFERENCE (a named profile), and selectModel picks the best CURRENT model — never a hard-coded id. Decidable OpenRouter facts as numbers; noisy benchmarks as COARSE TIERS with {source, asOf}; no cross-axis composite (blending is the selector's job). CANDIDATE tooling — NOT official OAS."
name: suluk-models
---

# @suluk/models

A weekly, PUBLIC-DATA-ONLY catalog of OpenRouter models + a selector: a suluk skill declares NEEDS (hard filters) + a small PREFERENCE (a named profile), and selectModel picks the best CURRENT model — never a hard-coded id. Decidable OpenRouter facts as numbers; noisy benchmarks as COARSE TIERS with {source, asOf}; no cross-axis composite (blending is the selector's job). CANDIDATE tooling — NOT official OAS.

## Quick Start

```ts
import { selectModel, OPENROUTER_CATALOG } from "@suluk/models";

const result = selectModel(
  // HardFilters — these FILTER (can empty the set ⇒ fail loud), never rank
  { needsTools: true, minWindowRequired: 200_000 },
  // Preferences — a named profile is the 90% case
  { profile: "tool-reliable" },
  OPENROUTER_CATALOG,
);

if (result.ranked.length === 0) {
  // FAIL LOUD — names the unsatisfiable filter(s), e.g. "min-window>=200000 (excluded 142)"
  throw new Error(`no model fits: ${result.unsatisfiable?.join("; ")}`);
}

const best = result.ranked[0];
best.id;                       // e.g. "anthropic/claude-sonnet-4.5"
best.why.passedFilters;        // ["tool-calling", "min-window>=200000", "status-active", ...]
best.why.decidingPreference;   // "intelligence (weight 3)"
best.why.tierByAxis;           // { intelligence: {tier, source, asOf}, latency: {...}, cost: {...} }
result.candidateCount;         // survivors after hard filtering
result.coverageGaps;           // soft axes with no data on the winner (honesty surface)
```

## Quick Reference

**select:** `selectModel`, `deriveRequirements` (Derive HardFilters from an agent/skill's declared needs + the analyzer's load (the C027 seam))
**bucketing:** `applyBucketing` (Bucket a raw leaderboard score into a coarse tier per the committed rule), `AxisRule`, `BUCKETING_RULES`
**normalize:** `normalizeOpenRouter`, `normalizeOpenRouterModel` (One OpenRouter model → its decidable fact cells (intel/gov tiers stay UNKNOWN; filled by the Class-B pass)), `catalogFrom`, `snapshotHash` (A content-addressed hash over the rows' load-bearing SELECTION inputs — facts AND intel tiers (a re-pick under a
different catalog must differ; reproducible pin; ties C027 contentHash)), `ORModel` (The subset of an OpenRouter `/models` row we rely on (all public facts))
**fetch:** `fetchOpenRouterCatalog` (Fetch OpenRouter `/models` and normalize to the fact-cell catalog)
**overlay:** `applyTierOverlay` (Overlay coarse tiers onto matching rows' intel cells, then re-hash (selection now depends on these tiers)), `IntelAxis`, `KNOWN_TIERS` (A SMALL, conservatively-CITED seed of coarse public standings for headline frontier models (the bootstrap until
the full Class-B curation lands))
**types:** `Tier` (`@suluk/models` — the catalog schema (council wf_729cde52-cc7)), `Cell` (One catalog value with provenance), `DataRetention`, `ModelRecord`, `ModelCatalog`, `HardFilters` (Hard requirements — these FILTER (can empty the set ⇒ fail-loud), never rank), `Profile`, `Preferences` (Preference — RANKS the survivors), `RankedModel`, `SelectResult`
**profiles:** `ResolvedProfile`, `PROFILES`
`OPENROUTER_CATALOG`
**catalog:** `SEED_CATALOG` (Illustrative seed — NOT the live catalog)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)