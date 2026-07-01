[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / verifySkillFreshness

# Function: verifySkillFreshness()

> **verifySkillFreshness**(`declaredHash`, `currentSnapshot`): [`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]

Defined in: [agents/src/conformance.ts:121](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/conformance.ts#L121)

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
