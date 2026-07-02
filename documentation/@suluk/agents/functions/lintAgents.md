[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / lintAgents

# Function: lintAgents()

> **lintAgents**(`doc`): [`LintFinding`](../interfaces/LintFinding.md)[]

Defined in: [agents/src/lint.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/lint.ts#L29)

`@suluk/agents` — the Suluk Agent composition layer (C027). Lint + project an `x-suluk-agents` map (skills +
deterministic routes + by-name sub-agents) into a Claude plugin AND an OpenRouter/OpenAI-compatible manifest:
one contract, two artifacts, zero network at generate time. This package is the OTHER side of the D1 wall —
it reads `x-suluk-agents`, which @suluk/core's matcher (buildAda/matchRequest) provably never does. Selection
and tiering are runtime-advisory; determinism is DECLARED, never enforced. CANDIDATE tooling — NOT official OAS.

NB (the C027 module-boundary invariant): @suluk/core MUST NEVER import @suluk/agents. The dependency is one-way.
test/core-boundary.test.ts enforces it as a maintained tripwire.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`LintFinding`](../interfaces/LintFinding.md)[]
