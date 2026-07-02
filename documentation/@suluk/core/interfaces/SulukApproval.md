[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukApproval

# Interface: SulukApproval

Defined in: [types.ts:411](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L411)

HUMAN-IN-THE-LOOP APPROVAL facet (Stage 1.4). Like x-suluk-cost/access/ratelimit it is an ADVISORY vendor extension
in the `x-suluk-*` namespace — the facet DECLARES the gate; a runtime adapter ENFORCES it (e.g. @suluk/agents'
`projectCloudflareAgent` emits the Cloudflare Agents SDK `needsApproval` predicate from it). STATIC by construction:
`required` is a fixed boolean — the facet NEVER carries a request-value selector (the D1 red-line), so a server can
never be pressured into a dynamic dispatch decision; the gate is "this action, always", decided at author time.

## Properties

### reason?

> `optional` **reason?**: `string`

Defined in: [types.ts:415](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L415)

why approval is needed — shown to the human approver and in docs.

***

### required

> **required**: `boolean`

Defined in: [types.ts:413](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L413)

require human approval before this operation runs as an agent tool.
