[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / durableBindings

# Function: durableBindings()

> **durableBindings**(`doc`, `appName?`): [`BindingPlan`](../interfaces/BindingPlan.md)

Defined in: [secrets.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/deploy/src/secrets.ts#L75)

The durable bindings a contract needs, derived from its facets: a rate-limit budget (x-suluk-ratelimit) needs a
KV counter store; a declared cost (x-suluk-cost) needs a KV sink. Emits the binding list + the
`wrangler kv namespace create` steps (the host runs them, then fills the ids into wrangler.jsonc).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### appName?

`string` = `"app"`

## Returns

[`BindingPlan`](../interfaces/BindingPlan.md)
