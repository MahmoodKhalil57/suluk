[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / Tier

# Type Alias: Tier

> **Tier** = `"frontier"` \| `"strong"` \| `"mid"` \| `"basic"` \| `"unknown"`

Defined in: [types.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/models/src/types.ts#L16)

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
