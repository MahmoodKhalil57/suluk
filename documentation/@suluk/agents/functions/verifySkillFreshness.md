[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / verifySkillFreshness

# Function: verifySkillFreshness()

> **verifySkillFreshness**(`declaredHash`, `currentSnapshot`): [`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]

Defined in: [agents/src/conformance.ts:121](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/conformance.ts#L121)

SKILL-FRESHNESS: a skill's declared `provenance.contentHash` must match the hash of the CURRENT served snapshot.
A mismatch means the served preprompt drifted after the contentHash was minted — an unsigned change in production
(the C021 supply-chain concern). No declared hash ⇒ a warning (drift is undetectable).

## Parameters

### declaredHash

`string` \| `undefined`

### currentSnapshot

`string`

## Returns

[`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]
