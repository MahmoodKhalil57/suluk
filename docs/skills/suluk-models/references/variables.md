# Variables & Constants

## `OPENROUTER_CATALOG`
```ts
const OPENROUTER_CATALOG: ModelCatalog
```

## catalog

### `SEED_CATALOG`
Illustrative seed — NOT the live catalog. Tiers reflect coarse public standing as of asOf; UNKNOWN is honest.
```ts
const SEED_CATALOG: ModelCatalog
```

## profiles

### `PROFILES`
```ts
const PROFILES: Record<Profile, ResolvedProfile>
```

## bucketing

### `BUCKETING_RULES`
```ts
const BUCKETING_RULES: Record<string, AxisRule>
```

## overlay

### `KNOWN_TIERS`
A SMALL, conservatively-CITED seed of coarse public standings for headline frontier models (the bootstrap until
the full Class-B curation lands). These are adopted public-consensus priors at a LOW ceiling — verify at source;
tune at review. Absent axes stay UNKNOWN. Source stamped `public-leaderboard-consensus`.
```ts
const KNOWN_TIERS: Record<string, Partial<Record<IntelAxis, Tier>>>
```
