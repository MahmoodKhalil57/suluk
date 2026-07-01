[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / verifyAgentFreshness

# Function: verifyAgentFreshness()

> **verifyAgentFreshness**(`manifest`, `snapshots`): [`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]

Defined in: [agents/src/manifest.ts:131](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/manifest.ts#L131)

Verify a signed manifest's skills against the CURRENT served snapshots: each skill's signed `contentHash` must
equal the hash of its current snapshot. A mismatch ⇒ the served preprompt drifted after the signature was minted
(a stale/unsigned change). A skill with no declared `contentHash` ⇒ unpinned (drift undetectable). Snapshots are
keyed qualified `"<agentKey>/<skillName>"` (preferred) OR bare `"<skillName>"` (back-compat) — the same dual-accept
`gradeAgent` and `resolveInstruction` use, so one `snapshots` map feeds every consumer; a skill with no provided
snapshot is skipped (cannot be checked here).

## Parameters

### manifest

[`AgentManifest`](../interfaces/AgentManifest.md)

### snapshots

`Record`\<`string`, `string`\>

## Returns

[`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]
