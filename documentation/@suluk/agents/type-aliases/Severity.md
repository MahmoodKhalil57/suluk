[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / Severity

# Type Alias: Severity

> **Severity** = `"error"` \| `"warning"` \| `"info"`

Defined in: [agents/src/lint.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/lint.ts#L12)

`@suluk/agents` — the Suluk Agent composition layer (C027). Lint + project an `x-suluk-agents` map (skills +
deterministic routes + by-name sub-agents) into a Claude plugin AND an OpenRouter/OpenAI-compatible manifest:
one contract, two artifacts, zero network at generate time. This package is the OTHER side of the D1 wall —
it reads `x-suluk-agents`, which @suluk/core's matcher (buildAda/matchRequest) provably never does. Selection
and tiering are runtime-advisory; determinism is DECLARED, never enforced. CANDIDATE tooling — NOT official OAS.

NB (the C027 module-boundary invariant): @suluk/core MUST NEVER import @suluk/agents. The dependency is one-way.
test/core-boundary.test.ts enforces it as a maintained tripwire.
