[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / effectiveUnderPolicies

# Function: effectiveUnderPolicies()

> **effectiveUnderPolicies**(`doc`, `agentName`): [`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)

Defined in: [agents/src/policy.ts:128](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/policy.ts#L128)

Apply ALL governing policies to an agent (MEET is associative/commutative — compose left-to-right).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

[`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)
