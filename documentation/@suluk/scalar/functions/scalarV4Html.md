[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/scalar](../README.md) / scalarV4Html

# Function: scalarV4Html()

> **scalarV4Html**(`doc`, `opts?`): [`RenderResult`](../interfaces/RenderResult.md)

Defined in: [index.ts:253](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/scalar/src/index.ts#L253)

The saasuluk-grade **v4 reference**: the self-hosted Scalar UI fed the v4 doc (faithful + facet-enriched), wrapped
in a suluk toolbar that adds the v4-native "View as" ROLE projector (Anonymous / Signed-in / Admin) — picking a
role re-mounts Scalar with that role's projected spec from `specUrl` — and a link out to the deep native renderer.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`ScalarV4Options`](../interfaces/ScalarV4Options.md) = `{}`

## Returns

[`RenderResult`](../interfaces/RenderResult.md)
