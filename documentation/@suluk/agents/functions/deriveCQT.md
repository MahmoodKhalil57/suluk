[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / deriveCQT

# Function: deriveCQT()

> **deriveCQT**(`skill`): `number`

Defined in: [agents/src/model-select.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/model-select.ts#L45)

cost_quality_tradeoff 0..10 (0=quality, 10=cost) — mechanical from the profile's cost-vs-intelligence weights
(set explicitly; do NOT inherit OpenRouter's cost-leaning default of 7).

## Parameters

### skill

[`SulukSkillRef`](../../core/interfaces/SulukSkillRef.md) \| `undefined`

## Returns

`number`
