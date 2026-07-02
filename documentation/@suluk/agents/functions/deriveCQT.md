[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / deriveCQT

# Function: deriveCQT()

> **deriveCQT**(`skill`): `number`

Defined in: [agents/src/model-select.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/model-select.ts#L45)

cost_quality_tradeoff 0..10 (0=quality, 10=cost) — mechanical from the profile's cost-vs-intelligence weights
(set explicitly; do NOT inherit OpenRouter's cost-leaning default of 7).

## Parameters

### skill

[`SulukSkillRef`](../../core/interfaces/SulukSkillRef.md) \| `undefined`

## Returns

`number`
