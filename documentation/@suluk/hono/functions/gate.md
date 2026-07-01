[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / gate

# Function: gate()

> **gate**(`rule`, `id`): [`GateDecision`](../interfaces/GateDecision.md)

Defined in: [tooling/ts/packages/hono/src/access.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/hono/src/access.ts#L51)

Decide whether a caller may run an op (per the rule), whether to scope the query to their own rows, and the honest
deny status. FAIL-CLOSED: an `owner` op with no principal is 401 (the wire must enforce what `x-suluk-access`
claims — a null-scoped empty 200 would let the facet lie); `admin` with no principal is 401, signed-in-non-admin is
403; `none` hard-denies 403. A signed-in owner is scoped to their rows; an admin sees all.

## Parameters

### rule

[`Rule`](../type-aliases/Rule.md)

### id

[`GateIdentity`](../interfaces/GateIdentity.md)

## Returns

[`GateDecision`](../interfaces/GateDecision.md)
