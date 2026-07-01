[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / AgentRouteView

# Interface: AgentRouteView

Defined in: [cockpit/src/agents.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cockpit/src/agents.ts#L23)

## Properties

### guarantee?

> `optional` **guarantee?**: `string`

Defined in: [cockpit/src/agents.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cockpit/src/agents.ts#L26)

***

### name

> **name**: `string`

Defined in: [cockpit/src/agents.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cockpit/src/agents.ts#L24)

***

### operationRef

> **operationRef**: `string`

Defined in: [cockpit/src/agents.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cockpit/src/agents.ts#L25)

***

### resolves

> **resolves**: `boolean`

Defined in: [cockpit/src/agents.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cockpit/src/agents.ts#L30)

does the operationRef resolve to a real operation? (false ⇒ a dangling ref, like Conin's MCP-only primitive).

***

### tier?

> `optional` **tier?**: `"resident"` \| `"cold-tail"`

Defined in: [cockpit/src/agents.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cockpit/src/agents.ts#L28)

serving partition: resident (default tool list) vs cold-tail (behind discover_tools). Absent ⇒ resident.
