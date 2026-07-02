[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / ProvisionResult

# Type Alias: ProvisionResult

> **ProvisionResult** = \{ `instanceId`: `string`; `outputs?`: `Record`\<`string`, `string`\>; `state`: `"succeeded"`; \} \| \{ `instanceId?`: `string`; `operation`: `string`; `outputs?`: `Record`\<`string`, `string`\>; `state`: `"in progress"`; \}

Defined in: [provision/src/types.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/types.ts#L86)

A broker's provision outcome — sync (ready now) or async (poll `lastOperation` with `operation`). An async ack MAY
 already carry `outputs` (e.g. a D1 create returns the database_id immediately even though the DB takes a moment to be
 queryable); they're threaded once the op settles, alongside any from `bind`.
