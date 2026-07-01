[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / deriveCQT

# Function: deriveCQT()

> **deriveCQT**(`skill`): `number`

Defined in: [agents/src/model-select.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/model-select.ts#L45)

cost_quality_tradeoff 0..10 (0=quality, 10=cost) — mechanical from the profile's cost-vs-intelligence weights
(set explicitly; do NOT inherit OpenRouter's cost-leaning default of 7).

## Parameters

### skill

[`SulukSkillRef`](../../core/interfaces/SulukSkillRef.md) \| `undefined`

## Returns

`number`
