[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / EffectiveSkill

# Interface: EffectiveSkill

Defined in: [agents/src/policy.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/policy.ts#L28)

## Properties

### model

> **model**: `string`[]

Defined in: [agents/src/policy.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/policy.ts#L31)

INTERSECT(skill.model, policy.modelAllowlist).

***

### name

> **name**: `string`

Defined in: [agents/src/policy.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/policy.ts#L29)

***

### tier?

> `optional` **tier?**: `"resident"` \| `"cold-tail"`

Defined in: [agents/src/policy.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/policy.ts#L32)

***

### usable

> **usable**: `boolean`

Defined in: [agents/src/policy.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/policy.ts#L34)

false ⇒ model ∩ allowlist = ∅: the operator's allowlist leaves this skill no model to run.
