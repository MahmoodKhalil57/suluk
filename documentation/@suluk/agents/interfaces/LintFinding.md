[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / LintFinding

# Interface: LintFinding

Defined in: [agents/src/lint.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/lint.ts#L13)

`@suluk/agents` — the Suluk Agent composition layer (C027). Lint + project an `x-suluk-agents` map (skills +
deterministic routes + by-name sub-agents) into a Claude plugin AND an OpenRouter/OpenAI-compatible manifest:
one contract, two artifacts, zero network at generate time. This package is the OTHER side of the D1 wall —
it reads `x-suluk-agents`, which @suluk/core's matcher (buildAda/matchRequest) provably never does. Selection
and tiering are runtime-advisory; determinism is DECLARED, never enforced. CANDIDATE tooling — NOT official OAS.

NB (the C027 module-boundary invariant): @suluk/core MUST NEVER import @suluk/agents. The dependency is one-way.
test/core-boundary.test.ts enforces it as a maintained tripwire.

## Properties

### agent

> **agent**: `string`

Defined in: [agents/src/lint.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/lint.ts#L17)

***

### at?

> `optional` **at?**: `string`

Defined in: [agents/src/lint.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/lint.ts#L20)

dotted locus within the agent, e.g. "routes.run_core_primitive.operationRef".

***

### code

> **code**: `string`

Defined in: [agents/src/lint.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/lint.ts#L16)

machine code, e.g. "agent-cycle", "missing-max-depth", "dangling-operation-ref", "request-value-selector".

***

### detail

> **detail**: `string`

Defined in: [agents/src/lint.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/lint.ts#L18)

***

### severity

> **severity**: [`Severity`](../type-aliases/Severity.md)

Defined in: [agents/src/lint.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/lint.ts#L14)
