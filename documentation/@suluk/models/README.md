[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/models

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

# @suluk/models

**A public-data-only model catalog + a selector — a skill declares NEEDS, the catalog picks the best CURRENT model, never a hard-coded id.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/models
```

## What it does

- **Filter then rank.** A caller passes `HardFilters` (capabilities, min-context, price caps, governance allowlist) + `Preferences` (a named profile, or ≤4 small integer weights). `selectModel` *filters* the catalog down to survivors, then *ranks* them — and explains why.
- **Decidable facts are numbers; noisy benchmarks are coarse TIERS.** Price / context / declared capabilities come straight from OpenRouter as real values. Third-party benchmark standings (`intel.*`) are bucketed to `frontier | strong | mid | basic` with `{source, asOf}` — never a fake 2-decimal score.
- **UNKNOWN is honest.** A missing cell stays `null` (never imputed to "worst", which would kill new models). Hard filters fail *closed* on unknown; soft axes surface as `coverageGaps` on the winner.
- **No stored composite.** The catalog keeps no blended "overall" score — blending is the selector's job at query time under explicit operator weights (storing a blend would launder preference as fact).
- **Two catalogs ship in the box.** `SEED_CATALOG` (small, hand-curated, for tests/examples) and `OPENROUTER_CATALOG` (the committed, content-addressed ~300-model artifact, regenerated weekly by `scripts/refresh.ts`).

## When to reach for it

- You're authoring a **suluk agent/skill** and don't want to pin a model id that goes stale (this is the seam `@suluk/agents` consumes). Declare what the task *needs* and let the catalog resolve the current best.
- You need a **policy-governed, reproducible** model pick: a `modelAllowlist` / `allowedRetention` MEET that a preference can never widen, plus a `snapshotHash` so the choice is reproducible week-over-week.
- You want a **"why this model"** explainer (filter trace + per-axis tier + coverage gaps) rather than a black box.

Reach elsewhere when: you need to *actually call* a model (that's the runtime client, e.g. `@suluk/chat`'s OpenRouter wiring) — this package only *selects*. And when you want per-endpoint region/latency facts: those are deliberately not in the schema yet (OpenRouter routes endpoints at runtime), so `gov.region` / `dataRetention` stay UNKNOWN at the model level rather than being faked.

## Usage

### Select a model from NEEDS + a profile

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

### The escape hatch — explicit weights + taskShape

A profile is a preset; power users override with ≤4 small int weights (`0..3`) and route the single "intelligence" knob to one INTEL sub-axis via `taskShape`.

```ts
const r = selectModel(
  { needsStructured: true },
  { prefer: { intelligence: 3, cost: 1, speed: 0, context: 1 }, taskShape: "coding" },
  OPENROUTER_CATALOG,
);
```

The six built-in profiles (`PROFILES`): `tool-reliable`, `cheap-fast`, `balanced`, `max-reasoning`, `long-context`, `vision`. Each is preset weights + auto-wired implied filters (e.g. `tool-reliable` implies `needsTools`, `vision` implies `inputModalities: ["image"]`).

### Governance — the terminal allowlist MEET

`policy` is fail-closed and non-overridable: a preference can never widen it, and an `unknown` governance cell is excluded.

```ts
selectModel(
  { policy: { modelAllowlist: ["google/gemini-2.5-flash"], allowedRetention: ["zero", "ephemeral"] } },
  { profile: "max-reasoning" },          // even max-reasoning can't escape the allowlist
  OPENROUTER_CATALOG,
);
```

### Derive HardFilters from an agent's structure

`deriveRequirements` is the seam that turns "this agent has tool routes + needs a 120k window" into filters:

```ts
import { deriveRequirements } from "@suluk/models";

deriveRequirements({ hasRoutes: true, minWindowRequired: 120_000 });
// → { needsTools: true, minWindowRequired: 120000 }
```

### Build / refresh the catalog (the weekly fetcher spine)

The committed catalog is regenerated, not hand-edited. The transform is pure + unit-tested; the live fetch is a thin wrapper.

```ts
import { fetchOpenRouterCatalog, applyTierOverlay, KNOWN_TIERS } from "@suluk/models";

// Class A: OpenRouter /models → the decidable fact-cell catalog (NETWORK — run from a script/CI, not tests)
let catalog = await fetchOpenRouterCatalog("2026-06-21");

// Class B: overlay coarse, cited benchmark tiers onto intel.* (KNOWN_TIERS is the conservative bootstrap seed)
catalog = applyTierOverlay(catalog, KNOWN_TIERS, { source: "public-leaderboard-consensus", asOf: "2026-06-21" });
```

The repo ships this as a script:

```sh
bun scripts/refresh.ts [asOf]   # → writes src/openrouter-catalog.json (committed, content-addressed)
```

For the pure pieces: `normalizeOpenRouter(models, asOf)` / `normalizeOpenRouterModel(m, asOf)` turn raw `ORModel[]` into fact cells, `catalogFrom(rows, asOf)` wraps them with a `snapshotHash`, and `applyBucketing(axis, score)` maps a raw leaderboard number to a tier per the committed `BUCKETING_RULES`.

## API

| Export | What it does |
| --- | --- |
| `selectModel(reqs, prefs, catalog)` | Filter (`HardFilters`) then rank (`Preferences`) → `SelectResult` with a per-model `why`. |
| `deriveRequirements(input)` | Map an agent/skill's declared structure → `HardFilters`. |
| `PROFILES` | The six named profiles → preset weights + implied filters (`ResolvedProfile`). |
| `OPENROUTER_CATALOG` | The committed, content-addressed ~300-model catalog (real prices/context/caps + a frontier intel seed). |
| `SEED_CATALOG` | A small hand-curated catalog for tests/examples. |
| `fetchOpenRouterCatalog(asOf, opts?)` | Live OpenRouter `/models` fetch → fact-cell `ModelCatalog`. |
| `normalizeOpenRouter` / `normalizeOpenRouterModel` | Pure `ORModel[]` → fact-cell records. |
| `catalogFrom(rows, asOf)` / `snapshotHash(rows)` | Wrap rows into a content-addressed `ModelCatalog`. |
| `applyTierOverlay(catalog, tiers, opts)` | Overlay coarse `intel.*` tiers onto matching rows; re-hashes. |
| `applyBucketing(axis, score)` / `BUCKETING_RULES` | Map a raw leaderboard metric → a coarse `Tier` per the committed, cited rules. |
| `KNOWN_TIERS` | A small, cited seed of frontier standings (the Class-B bootstrap). |

Types: `Tier`, `Cell`, `DataRetention`, `ModelRecord`, `ModelCatalog`, `HardFilters`, `Profile`, `Preferences`, `RankedModel`, `SelectResult`, `ResolvedProfile`, `AxisRule`, `IntelAxis`, `ORModel`.

## Boundary

This package **selects**, it does not **call**. It hands back ranked ids + a why-explainer; resolving that to a runtime target (pin a concrete id, fence an OpenRouter `openrouter/auto` router by the survivor set, or defer to a `~latest` alias) and actually invoking the model lives downstream in `@suluk/agents` and the runtime client.

The fact transform is pure and never reaches for the clock or the network: `asOf` is always **injected** (so a run is reproducible) and the only network call, `fetchOpenRouterCatalog`, is a thin wrapper you run from a weekly script/CI. The benchmark-tier overlay (`intel.*`) is a separate, lower-cadence, human-reviewed step — see [`REFRESH.md`](../../_media/REFRESH.md). Anything the catalog can't prove stays UNKNOWN; it is never imputed.

## License

Apache-2.0

## Interfaces

- [AxisRule](interfaces/AxisRule.md)
- [Cell](interfaces/Cell.md)
- [HardFilters](interfaces/HardFilters.md)
- [ModelCatalog](interfaces/ModelCatalog.md)
- [ModelRecord](interfaces/ModelRecord.md)
- [ORModel](interfaces/ORModel.md)
- [Preferences](interfaces/Preferences.md)
- [RankedModel](interfaces/RankedModel.md)
- [ResolvedProfile](interfaces/ResolvedProfile.md)
- [SelectResult](interfaces/SelectResult.md)

## Type Aliases

- [DataRetention](type-aliases/DataRetention.md)
- [IntelAxis](type-aliases/IntelAxis.md)
- [Profile](type-aliases/Profile.md)
- [Tier](type-aliases/Tier.md)

## Variables

- [BUCKETING\_RULES](variables/BUCKETING_RULES.md)
- [KNOWN\_TIERS](variables/KNOWN_TIERS.md)
- [OPENROUTER\_CATALOG](variables/OPENROUTER_CATALOG.md)
- [PROFILES](variables/PROFILES.md)
- [SEED\_CATALOG](variables/SEED_CATALOG.md)

## Functions

- [applyBucketing](functions/applyBucketing.md)
- [applyTierOverlay](functions/applyTierOverlay.md)
- [catalogFrom](functions/catalogFrom.md)
- [deriveRequirements](functions/deriveRequirements.md)
- [fetchOpenRouterCatalog](functions/fetchOpenRouterCatalog.md)
- [normalizeOpenRouter](functions/normalizeOpenRouter.md)
- [normalizeOpenRouterModel](functions/normalizeOpenRouterModel.md)
- [selectModel](functions/selectModel.md)
- [snapshotHash](functions/snapshotHash.md)
