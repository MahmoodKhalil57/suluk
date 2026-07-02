[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / effectiveUnderPolicies

# Function: effectiveUnderPolicies()

> **effectiveUnderPolicies**(`doc`, `agentName`): [`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)

Defined in: [agents/src/policy.ts:128](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/policy.ts#L128)

Apply ALL governing policies to an agent (MEET is associative/commutative — compose left-to-right).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

[`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)
