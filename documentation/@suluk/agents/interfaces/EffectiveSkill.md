[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / EffectiveSkill

# Interface: EffectiveSkill

Defined in: [agents/src/policy.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/policy.ts#L28)

## Properties

### model

> **model**: `string`[]

Defined in: [agents/src/policy.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/policy.ts#L31)

INTERSECT(skill.model, policy.modelAllowlist).

***

### name

> **name**: `string`

Defined in: [agents/src/policy.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/policy.ts#L29)

***

### tier?

> `optional` **tier?**: `"resident"` \| `"cold-tail"`

Defined in: [agents/src/policy.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/policy.ts#L32)

***

### usable

> **usable**: `boolean`

Defined in: [agents/src/policy.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/policy.ts#L34)

false ⇒ model ∩ allowlist = ∅: the operator's allowlist leaves this skill no model to run.
