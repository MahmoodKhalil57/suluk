[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / reachState

# Function: reachState()

> **reachState**(`facet`, `v`): `ReachState`

Defined in: [reference/src/facets.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/reference/src/facets.ts#L80)

Three-valued reachability — `full` (●), `scoped` (◐, reachable but restricted to the caller's OWN rows), or
`none` (·). Honest about owner-scoping: a signed-in user can call an owner-scoped op, but only over their own
data — not the same as full access. (The View-as lens treats full+scoped as "shown", none as "hidden".)

## Parameters

### facet

[`AccessFacet`](../interfaces/AccessFacet.md) \| `undefined`

### v

[`Viewer`](../interfaces/Viewer.md)

## Returns

`ReachState`
