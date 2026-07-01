[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / lintResources

# Function: lintResources()

> **lintResources**(`doc`): [`ResourceFinding`](../interfaces/ResourceFinding.md)[]

Defined in: [agents/src/resources.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/resources.ts#L68)

Lint the resources catalog + every agent's refs into it: catalog entries must be well-formed (description, valid
kind, pinned provenance), agent refs must resolve, retrieved content is flagged (advisory), and `kind: "script"` is
flagged a warning (CF Agent-Skill script execution is EARLY/experimental — C036's honest caveat). Pure; no throw.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`ResourceFinding`](../interfaces/ResourceFinding.md)[]
