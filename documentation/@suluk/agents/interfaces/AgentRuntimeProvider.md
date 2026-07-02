[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / AgentRuntimeProvider

# Interface: AgentRuntimeProvider\<O\>

Defined in: [agents/src/runtime.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/runtime.ts#L39)

A runtime target. PURE: it projects the agent into owned source; the host writes the files + deploys (mirrors DeployProvider).

## Type Parameters

### O

`O` = `Record`\<`string`, `unknown`\>

## Properties

### name

> **name**: `string`

Defined in: [agents/src/runtime.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/runtime.ts#L40)

## Methods

### project()

> **project**(`doc`, `agentName`, `opts?`): [`AgentRuntimeArtifacts`](AgentRuntimeArtifacts.md)

Defined in: [agents/src/runtime.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/runtime.ts#L41)

#### Parameters

##### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

##### agentName

`string`

##### opts?

`O`

#### Returns

[`AgentRuntimeArtifacts`](AgentRuntimeArtifacts.md)
