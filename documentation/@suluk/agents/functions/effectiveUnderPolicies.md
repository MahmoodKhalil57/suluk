[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / effectiveUnderPolicies

# Function: effectiveUnderPolicies()

> **effectiveUnderPolicies**(`doc`, `agentName`): [`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)

Defined in: [agents/src/policy.ts:128](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/policy.ts#L128)

Apply ALL governing policies to an agent (MEET is associative/commutative — compose left-to-right).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

[`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)
