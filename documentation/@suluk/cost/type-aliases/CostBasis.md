[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / CostBasis

# Type Alias: CostBasis

> **CostBasis** = `"per-call"` \| `"per-unit"` \| `"per-token"` \| `"per-1k-tokens"` \| `"per-second"` \| `"per-request"` \| `"per-mb"`

Defined in: [types.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cost/src/types.ts#L10)

The cost model — what an operation declares it costs you, and what a single request actually cost.

All money is integer **micro-USD** (1 USD = 1_000_000 µ$). Integers avoid float drift and are the rawest
possible representation — we display the data AS IT IS and let consumers build pricing on top. A cost has
COMPONENTS, each tied to a source (a third party, compute, egress, …) and a basis (per-call vs per-unit),
so the actual cost of a request is the fixed components plus the metered usage of the variable ones.
