[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / effectiveUnderPolicies

# Function: effectiveUnderPolicies()

> **effectiveUnderPolicies**(`doc`, `agentName`): [`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)

Defined in: [agents/src/policy.ts:128](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/policy.ts#L128)

Apply ALL governing policies to an agent (MEET is associative/commutative — compose left-to-right).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

[`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)
