[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / policyConstrain

# Function: policyConstrain()

> **policyConstrain**(`agentName`, `agent`, `policy`): [`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)

Defined in: [agents/src/policy.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/agents/src/policy.ts#L70)

Apply ONE operator policy to an agent — a monotone MEET. Returns the narrowed envelope + an audit of every cut.

## Parameters

### agentName

`string`

### agent

[`SulukAgent`](../../core/interfaces/SulukAgent.md)

### policy

[`SulukPolicy`](../../core/interfaces/SulukPolicy.md)

## Returns

[`PolicyConstrainResult`](../interfaces/PolicyConstrainResult.md)
