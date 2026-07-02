[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / renderSkillMd

# Function: renderSkillMd()

> **renderSkillMd**(`input`): `string`

Defined in: [agents/src/skill.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/skill.ts#L29)

Render a Claude SKILL.md: YAML frontmatter (name + description) + a GENERATED stamp carrying source, the
computed contentHash, and version — then the instructions body verbatim. Deterministic in its inputs.

## Parameters

### input

[`SkillRenderInput`](../interfaces/SkillRenderInput.md)

## Returns

`string`
