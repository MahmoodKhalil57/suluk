[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / TeardownResult

# Interface: TeardownResult

Defined in: [provision/src/teardown.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/teardown.ts#L22)

## Properties

### kept

> **kept**: `object`[]

Defined in: [provision/src/teardown.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/teardown.ts#L26)

refs kept + why: protected (no force) or the broker can't deprovision.

#### reason

> **reason**: `string`

#### ref

> **ref**: `string`

***

### state

> **state**: [`InstanceState`](InstanceState.md)[]

Defined in: [provision/src/teardown.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/teardown.ts#L28)

the remaining journal after teardown (the kept instances).

***

### torn

> **torn**: `string`[]

Defined in: [provision/src/teardown.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/teardown.ts#L24)

refs deprovisioned (or, under dryRun, that WOULD be).
