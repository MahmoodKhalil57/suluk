[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / ScopeEscalation

# Interface: ScopeEscalation

Defined in: [agents/src/scope.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/agents/src/scope.ts#L17)

## Properties

### child

> **child**: `string`

Defined in: [agents/src/scope.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/agents/src/scope.ts#L23)

the resolved child agent key.

***

### childLocal

> **childLocal**: `string`

Defined in: [agents/src/scope.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/agents/src/scope.ts#L21)

the local handle of the offending sub-agent.

***

### parent

> **parent**: `string`

Defined in: [agents/src/scope.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/agents/src/scope.ts#L19)

the agent whose declared grant is exceeded by a child.

***

### perms

> **perms**: `string`[]

Defined in: [agents/src/scope.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/agents/src/scope.ts#L25)

the permissions the child declares that the parent does NOT grant (silently dropped under intersection).
